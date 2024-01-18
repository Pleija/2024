using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using Puerts.Editor.Generator;
using UnityEditor;
using UnityEngine;

namespace Puerts.AutoUsing
{
    public static class GeneratorUsing
    {
        private const BindingFlags Flags = BindingFlags.Public | BindingFlags.Instance | BindingFlags.Static |
            BindingFlags.DeclaredOnly;

        public class GenInfo
        {
            public string Name;
            public string[] Parameters;
            public bool HasReturn;

            public override bool Equals(object obj)
            {
                if (obj != null && obj is GenInfo) {
                    var info = (GenInfo)obj;
                    if (Name != info.Name || Parameters.Length != info.Parameters.Length || HasReturn != info.HasReturn)
                        return false;
                    for (var i = 0; i < Parameters.Length; i++)
                        if (Parameters[i] != info.Parameters[i])
                            return false;
                    return true;
                }
                return base.Equals(obj);
            }

            public override int GetHashCode() => base.GetHashCode();
            public override string ToString() => string.Format("{0}<{1}>", Name, string.Join(", ", Parameters));
        }

        private static string GetFullname(Type type)
        {
            if (type.IsGenericType) {
                var fullName = string.IsNullOrEmpty(type.FullName) ? type.ToString() : type.FullName;
                var parts = fullName.Replace('+', '.').Split('`');
                var argTypenames = type.GetGenericArguments().Select(x => GetFullname(x)).ToArray();
                return parts[0] + "<" + string.Join(", ", argTypenames) + ">";
            }
            if (!string.IsNullOrEmpty(type.FullName))
                return type.FullName.Replace('+', '.');
            return type.ToString();
        }

        private static GenInfo ToGenInfo(Type type)
        {
            var invoke = type.GetMethod("Invoke", Flags);
            var parameters = (from p in invoke.GetParameters() select GetFullname(p.ParameterType)).ToList();
            var hasReturn = invoke.ReturnType != typeof(void);
            if (hasReturn)
                parameters.Add(GetFullname(invoke.ReturnType));
            return new GenInfo() {
                Name = hasReturn ? "UsingFunc" : "UsingAction",
                Parameters = parameters.ToArray(),
                HasReturn = hasReturn,
            };
        }

        private static bool IsDelegate(Type type)
        {
            if (type == null)
                return false;
            else if (type == typeof(Delegate))
                return true;
            else
                return IsDelegate(type.BaseType);
        }

        private static void AddRef(List<Type> refs, Type type)
        {
            if (type.IsArray)
                AddRef(refs, type.GetElementType());
            else if (IsDelegate(type) && !type.IsGenericParameter && type != typeof(Delegate) &&
                     type != typeof(MulticastDelegate))
                refs.Add(type);
        }

        private static bool IsSafeType(Type type)
        {
            var fullname = type.FullName;
            if (fullname != null && (fullname.Contains("*") || fullname.Contains("&"))) return false;
            if (PuertsConfig.IsExcluded(type)) return false;
            return true;
        }

        private static bool IsGenericType(Type type)
        {
            if (type.IsGenericParameter)
                return true;
            if (type.IsGenericType)
                return type.GetGenericArguments().FirstOrDefault(argType => IsGenericType(argType)) != null;
            return false;
        }

        private static bool ContainsValueParameter(Type type)
        {
            var invoke = type.GetMethod("Invoke", Flags);

            if (invoke != null) {
                var containsValueType = invoke.ReturnType != typeof(void) && invoke.ReturnType.IsValueType;

                foreach (var param in invoke.GetParameters()) {
                    if (IsGenericType(param.ParameterType) || !IsSafeType(param.ParameterType))
                        return false;
                    if (param.ParameterType.IsValueType)
                        containsValueType = true;
                }
                return containsValueType && !IsGenericType(invoke.ReturnType) && IsSafeType(invoke.ReturnType);
            }
            return false;
        }

        private static List<int> AllowArgumentsLength(string methodName)
        {
            return typeof(JsEnv).GetMethods(Flags).Where(m => m.IsGenericMethod && m.Name == methodName)
                .Select(m => m.GetGenericArguments().Length).ToList();
        }

        [MenuItem("Tools/PuerTS/Generate UsingCode", false, -401)]
        public static void GenerateUsingCode()
        {
            var start = DateTime.Now;
            var saveTo = "Assets/Gen/"; //Configure.GetCodeOutputDirectory();
            Directory.CreateDirectory(saveTo);
            GenerateCode(saveTo);
            Debug.Log("finished! use " + (DateTime.Now - start).TotalMilliseconds + " ms");
            //AssetDatabase.Refresh();
            UnityMenu.GenerateDTS();
            var dts = Configure.GetCodeOutputDirectory() + "/Typing/csharp/index.d.ts";
            File.WriteAllText(dts,
                File.ReadAllText(dts).Replace("declare namespace CS {",
                    "declare namespace CS {\n" + File.ReadAllText("Assets/Gen/Editor/Extra.d.ts")));
        }

        private static void GenerateCode(string saveTo)
        {
            var configure = Configure.GetConfigureByTags(new List<string>() {
                "Puerts.BindingAttribute",
            });
            var genTypes = configure["Puerts.BindingAttribute"].Select(kv => kv.Key).Where(o => o is Type).Cast<Type>()
                .Where(t => !t.IsGenericTypeDefinition);
            var refTypes = new List<Type>();

            foreach (var type in genTypes) {
                AddRef(refTypes, type);
                foreach (var field in type.GetFields(Flags)) AddRef(refTypes, field.FieldType);
                foreach (var prop in type.GetProperties(Flags))
                    AddRef(refTypes, (prop.CanRead ? prop.GetMethod : prop.SetMethod).ReturnType);

                foreach (var method in type.GetMethods(Flags)) {
                    AddRef(refTypes, method.ReturnType);
                    foreach (var param in method.GetParameters())
                        AddRef(refTypes, param.ParameterType);
                }
            }
            var allowVoid = AllowArgumentsLength("UsingAction");
            var allowReturn = AllowArgumentsLength("UsingFunc");
            var genInfos = new List<GenInfo>();

            var failed = new List<string>();

            foreach (var type in refTypes.Distinct())
                if (ContainsValueParameter(type)) {
                    var info = ToGenInfo(type);

                    if ((info.HasReturn && !allowReturn.Contains(info.Parameters.Length)) ||
                        (!info.HasReturn && !allowVoid.Contains(info.Parameters.Length))) {
                        failed.Add(string.Format("Method parameter length don't match:{0} \nSource  type: {1} ", info, type.ToString()));
                        continue;
                    }
                    if (genInfos.Contains(info))
                        continue;
                    genInfos.Add(info);
                }

            if(failed.Any()) Debug.Log(failed.JoinStr("\n"));

            using (var jsEnv = new JsEnv()) {
                var autoRegisterRender =
                    jsEnv.ExecuteModule<Func<GenInfo[], string>>("puerts/templates/wrapper-reg-using.tpl.cjs",
                        "AutoRegTemplate");

                using (var textWriter = new StreamWriter(saveTo + "AutoStaticCodeUsing.cs", false, Encoding.UTF8)) {
                    var fileContext = autoRegisterRender(genInfos
                        .OrderBy(o => o.Name + "<" + string.Join(", ", o.Parameters)).ToArray());
                    textWriter.Write(fileContext);
                    textWriter.Flush();
                }
            }
        }
    }
}
