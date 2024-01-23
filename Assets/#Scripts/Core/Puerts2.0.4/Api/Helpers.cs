using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;

namespace Puerts
{
    public static class Helpers
    {
        static List<Type> type_def_extention_method = new List<Type>();

        private static Dictionary<Type, IEnumerable<MethodInfo>> _cache =
            new Dictionary<Type, IEnumerable<MethodInfo>>();

        public static Dictionary<Type, IEnumerable<MethodInfo>> extensionMethodMap {
            get {
                if (!type_def_extention_method.Any()) {
                    CheckExtensions();
                    _cache = (from type in type_def_extention_method.Distinct()
                        // #if UNITY_EDITOR
                        //                                       where !type.Assembly.Location.Contains("Editor")
                        // #endif
                        from method in type.GetMethods(BindingFlags.Static | BindingFlags.Public)
                        where method.IsDefined(typeof(ExtensionAttribute), false) /*&& IsSupportedMethod(method)*/
                        group method by GetExtendedType(method)).ToDictionary(g => g.Key,
                        g => g as IEnumerable<MethodInfo>);
                }
                return _cache;
            }
        }

        [MenuItem("Tests/Js Extensions")]
        public static void Test()
        {
            // CheckExtensions();
            // var extensionMethodMap = (from type in type_def_extention_method.Distinct()
            //     // #if UNITY_EDITOR
            //     //                                       where !type.Assembly.Location.Contains("Editor")
            //     // #endif
            //     from method in type.GetMethods(BindingFlags.Static | BindingFlags.Public)
            //     where method.IsDefined(typeof(ExtensionAttribute), false) /*&& IsSupportedMethod(method)*/
            //     group method by GetExtendedType(method)).ToDictionary(g => g.Key, g => g as IEnumerable<MethodInfo>);
            // Debug.Log(type_def_extention_method.Count);
            Debug.Log(extensionMethodMap.Values.SelectMany(x => x)
                .Where(t => t.Name.Contains("ForEach"))
                .Select(x =>
                    //   x.GetNiceName())
                    $"{x.ReturnType.GetTsTypeName()} {x.DeclaringType.GetTsTypeName()}.{x.Name}{(x.ContainsGenericParameters ? "<" + x.GetGenericArguments().Select(t => t.GetTsTypeName()).JoinStr(", ") + ">" : "")}({x.GetParameters().Select(p => p.Name + ": " + p.ParameterType.GetTsTypeName(true)).JoinStr(", ")})")
                .JoinStr("\n"));
        }

        public static bool IsSupportedMethod(MethodInfo method)
        {
            return true;
#if !UNITY_EDITOR && ENABLE_IL2CPP && !PUERTS_REFLECT_ALL_EXTENSION
            if (method.IsGenericMethodDefinition) return false;
#endif
            if (!method.ContainsGenericParameters) return true;
            var methodParameters = method.GetParameters();
            var returnType = method.ReturnType;
            var hasValidGenericParameter = false;
            var returnTypeValid = !returnType.IsGenericParameter;

            // 在参数列表里找得到和泛型参数相同的参数
            for (var i = 0; i < methodParameters.Length; i++) {
                var parameterType = methodParameters[i].ParameterType;

                // 如果参数是泛型参数
                if (parameterType.IsGenericParameter) {
                    // 所有参数的基类都不是值类型，且不是另一个泛型
                    if (
                        parameterType.BaseType != null && (
                            parameterType.BaseType.IsValueType ||
                            (
                                parameterType.BaseType.IsGenericType &&
                                !parameterType.BaseType.IsGenericTypeDefinition
                            )
                        )
                    )
                        return false;
                    var parameterConstraints = parameterType.GetGenericParameterConstraints();
                    // 所有泛型参数都有值类型约束
                    if (parameterConstraints.Length == 0) return false;

                    foreach (var parameterConstraint in parameterConstraints) {
                        // 所有泛型参数的类型约束都不是值类型
                        if (!parameterConstraint.IsClass() || (parameterConstraint == typeof(ValueType))) return false;
                    }
                    hasValidGenericParameter = true;

                    if (!returnTypeValid) {
                        if (parameterType == returnType) {
                            returnTypeValid = true;
                        }
                    }
                }
            }
            return hasValidGenericParameter && returnTypeValid;
        }

        public static Type GetExtendedType(MethodInfo method)
        {
            if (method.GetParameters().Length == 0) return method.DeclaringType;
            var type = method.GetParameters()[0].ParameterType;
            if (!type.IsGenericParameter) return type;
            var parameterConstraints = type.GetGenericParameterConstraints();
            if (parameterConstraints.Length == 0) return method.DeclaringType; // throw new InvalidOperationException();
            var firstParameterConstraint = parameterConstraints[0];
            if (!firstParameterConstraint.IsClass()) ; //throw new InvalidOperationException();
            return firstParameterConstraint;
        }

        // #lizard forgives
        public static string GetTsTypeName(this Type type, bool isParams = false)
        {
            if (type == typeof(int)) return "number";

            if (type == typeof(uint))
                return "number";
            else if (type == typeof(short))
                return "number";
            else if (type == typeof(byte))
                return "number";
            else if (type == typeof(sbyte))
                return "number";
            else if (type == typeof(char))
                return "number";
            else if (type == typeof(ushort))
                return "number";
            else if (type == typeof(bool))
                return "boolean";
            else if (type == typeof(long))
                return "bigint";
            else if (type == typeof(ulong))
                return "bigint";
            else if (type == typeof(float))
                return "number";
            else if (type == typeof(double))
                return "number";
            else if (type == typeof(string))
                return "string";
            else if (type == typeof(void))
                return "void";
            else if (type == typeof(Puerts.ArrayBuffer))
                return "ArrayBuffer";
            else if (type == typeof(object))
                return "any";
            else if (type == typeof(Delegate) || type == typeof(Puerts.GenericDelegate))
                return "Function";
#if CSHARP_7_3_OR_NEWER
            else if (type == typeof(System.Threading.Tasks.Task))
                return "$Task<any>";
#endif
            else if (type.IsByRef)
                return "$Ref<" + GetTsTypeName(type.GetElementType()) + ">";
            else if (type.IsArray)
                return isParams ? (GetTsTypeName(type.GetElementType()) + "[]") :
                    ("System.Array$1<" + GetTsTypeName(type.GetElementType()) + ">");
            else if (type.IsGenericType) {
                var underlyingType = Nullable.GetUnderlyingType(type);

                if (underlyingType != null) {
                    return GetTsTypeName(underlyingType) + " | null";
                }
                var fullName = type.FullName == null ? type.ToString() : type.FullName;
                var parts = fullName.Replace('+', '.').Split('`');
                var argTypenames = type.GetGenericArguments()
                    .Select(x => GetTsTypeName(x))
                    .ToArray();
                return parts[0] + '$' + parts[1].Split('[')[0] + "<" + string.Join(", ", argTypenames) + ">";
            }
            else if (type.FullName == null)
                return type.ToString();
            else
                return type.FullName.Replace('+', '.');
        }

        public static Type GetRawType(Type type)
        {
            if (type.IsByRef || type.IsArray) {
                return GetRawType(type.GetElementType());
            }
            if (type.IsGenericType) return type.GetGenericTypeDefinition();
            return type;
        }

        public static void CheckExtensions()
        {
            IEnumerator<Type> enumerator = Puerts.Utils.GetAllTypes().GetEnumerator();

            while (enumerator.MoveNext()) {
                Type type = enumerator.Current;

                if (type.IsDefined(typeof(ExtensionAttribute), false)) {
                    type_def_extention_method.Add(type);
                }
                if (!type.IsAbstract() || !type.IsSealed()) continue;
                var fields = type.GetFields(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic |
                    BindingFlags.DeclaredOnly);

                for (int i = 0; i < fields.Length; i++) {
                    var field = fields[i];

                    if ((typeof(IEnumerable<Type>)).IsAssignableFrom(field.FieldType)) {
                        var types = field.GetValue(null) as IEnumerable<Type>;

                        if (types != null) {
                            var list = types.ToList()
                                .Where(t =>
                                    t != null && t.IsDefined(typeof(ExtensionAttribute), false));
                            type_def_extention_method.AddRange(list);
                        }
                    }
                }
                var props = type.GetProperties(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic |
                    BindingFlags.DeclaredOnly);

                for (int i = 0; i < props.Length; i++) {
                    var prop = props[i];
                    if (!prop.CanRead) continue;

                    if ((typeof(IEnumerable<Type>)).IsAssignableFrom(prop.PropertyType)) {
                        var types = prop.GetValue(null, null) as IEnumerable<Type>;

                        if (types != null) {
                            type_def_extention_method.AddRange(types.Where(t =>
                                t != null && t.IsDefined(typeof(ExtensionAttribute), false)));
                        }
                    }
                }
            }
            enumerator.Dispose();
        }
    }
}
