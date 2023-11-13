using System;
using System.CodeDom;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using DG.Tweening;
using Microsoft.CSharp;
using UnityEditor;
using UnityEngine;

namespace EasyDOTween
{
    public static class CodeGenerator
    {
        private const string SAVE_PATH = "Packages/com.pleija.core/Vendor/EasyDOTween";
        //"Assets/Plugins/Addons/EasyDOTween";

        //"Assets/EasyDOTween";

        [MenuItem("Tools/EasyDOTween/GenerateAnimations")]
        private static void Generate()
        {
            Generate(typeof(ShortcutExtensions));
            Generate(typeof(DOTweenModuleAudio), PreprocessorTmpl(nameof(DOTweenModuleAudio)));
            Generate(typeof(DOTweenModulePhysics), PreprocessorTmpl(nameof(DOTweenModulePhysics)));
            Generate(typeof(DOTweenModulePhysics2D),
                PreprocessorTmpl(nameof(DOTweenModulePhysics2D)));
            Generate(typeof(DOTweenModuleSprite), PreprocessorTmpl(nameof(DOTweenModuleSprite)));
            Generate(typeof(DOTweenModuleUI), PreprocessorTmpl(nameof(DOTweenModuleUI)));
        }

        public static string GetMacroName(string name) =>
            $"{nameof(EasyDOTween)}_{name.Replace("DOTweenModule", string.Empty)}";

        private static string PreprocessorTmpl(string name) =>
            $"#if {GetMacroName(name)}\n{{0}}\n#endif";

        private static void Generate(Type t, string tmpl = "{0}")
        {
            var i = 0;
            var typeNamesSet = new HashSet<string>();

            foreach(var methodInfo in t.GetMethods(BindingFlags.Static | BindingFlags.Public)) {
                var parameters = methodInfo.GetParameters();
                var p = parameters.First();
                if(!p.ParameterType.IsSubclassOf(typeof(Component))) continue;
                var unit = Generate(methodInfo);
                var type = unit.Namespaces[0].Types[0];
                var key = $"{p.ParameterType.Name}_{type.Name}";
                if(typeNamesSet.Contains(key)) type.Name = $"{type.Name}_{i++}";
                typeNamesSet.Add(key);
                var savePath = $"{SAVE_PATH}/Behaviours/{p.ParameterType.Name}";
                unit.Save(savePath, tmpl);
            }
            typeNamesSet.Clear();
            AssetDatabase.Refresh();
        }

        private static CodeCompileUnit Generate(MethodInfo methodInfo)
        {
            var parameters = methodInfo.GetParameters();
            var firstParameter = parameters.First();
            var durationParameter = parameters.First(x => x.Name == "duration");
            var compileUnit = new CodeCompileUnit();
            var codeNamespace =
                new CodeNamespace(
                    $"{nameof(EasyDOTween)}.Animation.{firstParameter.ParameterType.Name}");
            codeNamespace.Imports.Add(new CodeNamespaceImport("DG.Tweening"));
            var animation = new CodeTypeDeclaration(methodInfo.Name) {
                IsClass = true,
                BaseTypes = {
                    new CodeTypeReference(typeof(Animation<>)) {
                        TypeArguments = {
                            new CodeTypeReference(firstParameter.ParameterType),
                        },
                    },
                },
                CustomAttributes = {
                    new CodeAttributeDeclaration(new CodeTypeReference(typeof(AddComponentMenu)),
                        new CodeAttributeArgument(new CodePrimitiveExpression(
                            $"{nameof(EasyDOTween)}/{firstParameter.ParameterType.Name}/{methodInfo.Name}"))),
                },
            };
            if(firstParameter.ParameterType != typeof(Transform))
                animation.CustomAttributes.Add(firstParameter.ParameterType
                    .ToRequireComponentCodeDom());

            foreach(var info in parameters) {
                if(info == firstParameter || info == durationParameter) continue;
                var field = new CodeMemberField(info.ParameterType, info.Name) {
                    CustomAttributes = {
                        new CodeAttributeDeclaration(new CodeTypeReference(typeof(SerializeField))),
                    },
                };
                if(info.ParameterType.IsPrimitive && info.HasDefaultValue)
                    field.InitExpression = new CodePrimitiveExpression(info.DefaultValue);
                animation.Members.Add(field);
            }
            var method = new CodeMemberMethod {
                Name = "CreateTween",
                Attributes = MemberAttributes.Override | MemberAttributes.Family,
                ReturnType = new CodeTypeReference(typeof(Tween)),
                Parameters = {
                    firstParameter.ToCodeDom(),
                    durationParameter.ToCodeDom(),
                },
            };
            var varExpression = new CodeVariableReferenceExpression(firstParameter.Name);
            var methodInvokeExpression =
                new CodeMethodInvokeExpression(varExpression, methodInfo.Name);

            for(var i = 1; i < parameters.Length; i++) {
                var info = parameters[i];
                methodInvokeExpression.Parameters.Add(
                    new CodeVariableReferenceExpression(info.Name));
            }
            method.Statements.Add(new CodeMethodReturnStatement(methodInvokeExpression));
            animation.Members.Add(method);
            codeNamespace.Types.Add(animation);
            compileUnit.Namespaces.Add(codeNamespace);
            return compileUnit;
        }

        private static void Save(this CodeCompileUnit compileUnit, string savePath,
            string tmpl = "{0}")
        {
            var sb = new StringBuilder();
            var provider = new CSharpCodeProvider();

            using(var sw = new StringWriter(sb)) {
                provider.GenerateCodeFromCompileUnit(compileUnit, sw, new CodeGeneratorOptions {
                    BracingStyle = "C",
                });
            }
            if(!Directory.Exists(savePath)) Directory.CreateDirectory(savePath);
            var t = compileUnit.Namespaces[0].Types[0];
            var code = string.Format(tmpl, sb);
            File.WriteAllText($"{savePath}/{t.Name}.cs", code);
        }

        private static CodeParameterDeclarationExpression
            ToCodeDom(this ParameterInfo parameterInfo) =>
            new CodeParameterDeclarationExpression(parameterInfo.ParameterType, parameterInfo.Name);

        private static CodeAttributeDeclaration ToRequireComponentCodeDom(this Type type)
        {
            var typeRef = new CodeTypeReference(typeof(RequireComponent));
            var attrArg = new CodeAttributeArgument(new CodeTypeOfExpression(type));
            return new CodeAttributeDeclaration(typeRef, attrArg);
        }

        private static string ToSuitedName(this Type t)
        {
            if(t == typeof(int)) return "int";
            if(t == typeof(float)) return "float";
            if(t == typeof(double)) return "double";
            return t.Name;
        }
    }
}
