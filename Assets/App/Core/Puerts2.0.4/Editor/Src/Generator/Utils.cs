/*
 * Tencent is pleased to support the open source community by making Puerts available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
 * Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms.
 * This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
 */

#region
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Puerts.Editor.Generator.Wrapper;
#endregion

namespace Puerts.Editor
{
    namespace Generator
    {
        internal class Utils
        {
            public const BindingFlags Flags = BindingFlags.Public
                    | BindingFlags.Instance
                    | BindingFlags.Static
                    | BindingFlags.DeclaredOnly;

            private static List<Func<MemberInfo, bool>> InstructionsFilters =
                    new List<Func<MemberInfo, bool>>();

            private static List<Func<Type, bool>> DisallowedTypeFilters =
                    new List<Func<Type, bool>>();

            private static List<Func<MemberInfo, BindingMode>> BindingModeFilters =
                    new List<Func<MemberInfo, BindingMode>>();

            public static bool HasFilter;

            public static Dictionary<Type, bool> blittableTypes = new Dictionary<Type, bool> {
                { typeof(byte), true }, { typeof(sbyte), true }, { typeof(short), true },
                { typeof(ushort), true }, { typeof(int), true }, { typeof(uint), true },
                { typeof(long), true }, { typeof(ulong), true }, { typeof(float), true },
                { typeof(double), true }, { typeof(IntPtr), true }, { typeof(UIntPtr), true },
                { typeof(char), false }, { typeof(bool), false },
            };

            public static Dictionary<Type, MethodInfo[]> extensionMethods;

            public static void SetFilters(List<MethodInfo> filters)
            {
                if (filters == null) {
                    HasFilter = false;
                    InstructionsFilters.Clear();
                    BindingModeFilters.Clear();
                    DisallowedTypeFilters.Clear();
                    return;
                }
                HasFilter = true;

                foreach (var filter in filters)
                    if (filter.GetParameters().Length == 2) {
                        if (filter.ReturnType == typeof(BindingMode)) {
                            var dlg =
                                    (Func<FilterAction, MemberInfo, BindingMode>)
                                    Delegate.CreateDelegate(
                                        typeof(Func<FilterAction, MemberInfo, BindingMode>),
                                        filter);
                            BindingModeFilters.Add(mbi => {
                                return dlg(FilterAction.BindingMode, mbi);
                            });
                        }
                        else if (filter.ReturnType == typeof(bool)) {
                            var pType = filter.GetParameters()[1].ParameterType;

                            if (pType == typeof(MemberInfo)) {
                                var dlg =
                                        (Func<FilterAction, MemberInfo, bool>)Delegate
                                                .CreateDelegate(
                                                    typeof(Func<FilterAction, MemberInfo, bool>),
                                                    filter);
                                BindingModeFilters.Add(mbi => {
                                    var res = dlg(FilterAction.BindingMode, mbi);
                                    return res ? BindingMode.SlowBinding
                                            : BindingMode.FastBinding;
                                });
                                InstructionsFilters.Add(mbi => {
                                    return dlg(FilterAction.MethodInInstructions, mbi);
                                });
                            }
                            else if (pType == typeof(Type)) {
                                var dlg = (Func<FilterAction, Type, bool>)Delegate.CreateDelegate(
                                    typeof(Func<FilterAction, Type, bool>), filter);
                                DisallowedTypeFilters.Add(type => {
                                    return dlg(FilterAction.DisallowedType, type);
                                });
                            }
                        }
                    }
                    else {
                        if (filter.ReturnType == typeof(BindingMode)) {
                            BindingModeFilters.Add(
                                (Func<MemberInfo, BindingMode>)Delegate.CreateDelegate(
                                    typeof(Func<MemberInfo, BindingMode>), filter));
                        }
                        else if (filter.ReturnType == typeof(bool)) {
                            var dlg = (Func<MemberInfo, bool>)Delegate.CreateDelegate(
                                typeof(Func<MemberInfo, bool>), filter);
                            BindingModeFilters.Add(mbi => {
                                var res = dlg(mbi);
                                return res ? BindingMode.SlowBinding : BindingMode.FastBinding;
                            });
                        }
                    }
                // else if (filter.ReturnType == typeof(FilterClass))
                // {
                //     FilterClass fc = (FilterClass)filter.Invoke(null, new object[] {});
                //      InstructionsFilters.Add(fc.InstructionsFilter);
                //      BindingModeFilters.Add(fc.BindingModeFilter);
                // }
            }

            public static string GetGenName(Type type)
            {
                if (type.IsGenericType) {
                    var argNames = type.GetGenericArguments().Select(x => GetGenName(x)).ToArray();
                    return type.FullName.Split('`')[0] + "<" + string.Join(", ", argNames) + ">";
                }
                return type.FullName;
            }

            public static bool isBlittableType(Type type)
            {
                if (type.IsValueType) {
                    bool ret;

                    if (!blittableTypes.TryGetValue(type, out ret)) {
                        ret = true;
                        if (type.IsPrimitive) return false;

                        foreach (var fieldInfo in type.GetFields(BindingFlags.Public
                            | BindingFlags.NonPublic
                            | BindingFlags.Instance
                            | BindingFlags.DeclaredOnly))
                            if (!isBlittableType(fieldInfo.FieldType)) {
                                ret = false;
                                break;
                            }
                        blittableTypes[type] = ret;
                    }
                    return ret;
                }
                return false;
            }

            public static bool IsDelegate(Type type)
            {
                if (type == null) return false;
                if (type == typeof(Delegate)) return true;
                return IsDelegate(type.BaseType);
            }

            public static bool IsStatic(PropertyInfo propertyInfo)
            {
                var getMethod = propertyInfo.GetGetMethod();
                var setMethod = propertyInfo.GetSetMethod();
                return getMethod == null ? setMethod.IsStatic : getMethod.IsStatic;
            }

            internal static bool isDisallowedType(Type type)
            {
                var result = false;
                foreach (var filter in DisallowedTypeFilters) result = result || filter(type);
                return result;
            }

            internal static BindingMode getBindingMode(MemberInfo mbi)
            {
                var strictestMode = BindingMode.FastBinding;

                foreach (var filter in BindingModeFilters) {
                    var mode = filter(mbi);
                    strictestMode = strictestMode > mode ? mode : strictestMode;
                }
                return strictestMode;
            }

            internal static bool shouldNotGetArgumentsInInstructions(MemberInfo mbi)
            {
                var result = false;
                foreach (var filter in InstructionsFilters) result = result || filter(mbi);
                return result;
            }

            protected static bool IsObsolete(MemberInfo mbi) => mbi
                                    .GetCustomAttributes(typeof(ObsoleteAttribute), false)
                                    .FirstOrDefault() as
                            ObsoleteAttribute
                    != null;

            public static bool IsNotSupportedMember(MemberInfo mbi, bool notFiltEII = false)
            {
                if (mbi == null) return false;
                if (IsObsolete(mbi) /* && oa.IsError*/) //希望只过滤掉Error类别过时方法可以把oa.IsError加上
                    return true;

                if (mbi is FieldInfo) {
                    var fi = mbi as FieldInfo;
                    if (fi.FieldType.IsPointer
#if UNITY_2021_2_OR_NEWER
                        || fi.FieldType.IsByRefLike
#endif
                    )
                        return true;

                    if (!fi.IsPublic) {
                        if (notFiltEII)
                            return !fi.Name.Contains("."); /*explicit interface implementation*/
                        return true;
                    }
                }
                ;

                if (mbi is PropertyInfo) {
                    var pi = mbi as PropertyInfo;
                    if (pi.PropertyType.IsPointer
#if UNITY_2021_2_OR_NEWER
                        || pi.PropertyType.IsByRefLike
#endif
                    )
                        return true;
                    var getMethod = pi.GetGetMethod();
                    var setMethod = pi.GetSetMethod();

                    if (!((getMethod != null && getMethod.IsPublic && !IsObsolete(getMethod))
                        || (setMethod != null && setMethod.IsPublic && !IsObsolete(setMethod)))) {
                        if (notFiltEII) return !pi.Name.Contains(".");
                        return true;
                    }
                }

                if (mbi is MethodInfo) {
                    var mi = mbi as MethodInfo;
                    if (mi.Name.Contains("$"))
                            // fix #964
                        return true;
                    if (mi.ReturnType.IsPointer
#if UNITY_2021_2_OR_NEWER
                        || mi.ReturnType.IsByRefLike
#endif
                    )
                        return true;

                    if (!mi.IsPublic) {
                        if (notFiltEII) return !mi.Name.Contains(".");
                        return true;
                    }
                }

                if (mbi is MethodBase) {
                    var mb = mbi as MethodBase;
                    if (mb.GetParameters()
                        .Any(pInfo => pInfo.ParameterType.IsPointer
#if UNITY_2021_2_OR_NEWER
                                || pInfo.ParameterType.IsByRefLike
#endif
                        ))
                        return true;
                    if (!mb.IsPublic) return true;
                }
                return false;
            }

            public static bool isDefined(MethodBase test, Type type)
            {
#if PUERTS_GENERAL
                return test.GetCustomAttributes(false).Any(ca => ca.GetType().ToString() == type.ToString());
#else
                return test.IsDefined(type, false);
#endif
            }

            public static Type ToConstraintType(Type type, bool isGenericTypeDefinition)
            {
                if (type.IsGenericType)
                    return type.GetGenericTypeDefinition()
                            .MakeGenericType(type
                                    .GetGenericArguments()
                                    .Select(t => ToConstraintType(t, isGenericTypeDefinition))
                                    .ToArray());
                if (!isGenericTypeDefinition
                    && type.IsGenericParameter
                    && type.BaseType != null
                    && type.BaseType != typeof(object)
                    && type.BaseType != typeof(ValueType))
                    return ToConstraintType(type.BaseType, false);
                return type;
            }

            public static bool IsGetterOrSetter(MethodInfo method) => (method.IsSpecialName
                        && method.Name.StartsWith("get_")
                        && method.GetParameters().Length != 1)
                    || (method.IsSpecialName
                        && method.Name.StartsWith("set_")
                        && method.GetParameters().Length != 2);

            public static void FillEnumInfo(DataTypeInfo info, Type type)
            {
                if (type.IsEnum) {
                    info.IsEnum = true;
                    info.UnderlyingTypeName = Enum.GetUnderlyingType(type).GetFriendlyName();
                }
            }

            public static string GetWrapTypeName(Type type) => type.ToString()
                            .Replace("+", "_")
                            .Replace(".", "_")
                            .Replace("`", "_")
                            .Replace("&", "_")
                            .Replace("[", "_")
                            .Replace("]", "_")
                            .Replace(",", "_")
                    + "_Wrap";

            public static string ToCode(JsValueType ExpectJsType)
            {
                return string.Join(" | ",
                    ExpectJsType.ToString()
                            .Split(',')
                            .Select(s => "Puerts.JsValueType." + s.Trim())
                            .ToArray());
            }

            public static Type RemoveRefAndToConstraintType(Type type)
            {
                if (type.IsGenericType)
                    return type.GetGenericTypeDefinition()
                            .MakeGenericType(type
                                    .GetGenericArguments()
                                    .Select(t => RemoveRefAndToConstraintType(t))
                                    .ToArray());
                if (type.IsGenericParameter
                    && type.BaseType != null
                    && type.BaseType != typeof(object)
                    && type.BaseType != typeof(ValueType))
                    return RemoveRefAndToConstraintType(type.BaseType);
                if (type.IsByRef) return RemoveRefAndToConstraintType(type.GetElementType());
                return type;
            }

            public static Type getExtendedType(MethodInfo method)
            {
                var type = method.GetParameters()[0].ParameterType;
                return type.IsGenericParameter ? type.BaseType : type;
            }

            public static MethodInfo[] GetExtensionMethods(Type checkType, HashSet<Type> genTypeSet)
            {
                if (extensionMethods == null)
                    extensionMethods = (from type in genTypeSet
                        from method in type.GetMethods(BindingFlags.Static | BindingFlags.Public)
                        where isDefined(method, typeof(ExtensionAttribute))
                                && Puerts.Utils.IsNotGenericOrValidGeneric(method)
                        group method by getExtendedType(method)).ToDictionary(g => g.Key,
                        g => g.ToArray());
                MethodInfo[] ret;
                if (!extensionMethods.TryGetValue(checkType, out ret)) return new MethodInfo[] { };
                return ret;
            }

            // #lizard forgives
            public static string GetTsTypeName(Type type, bool isParams = false)
            {
                if (type == typeof(int)) return "number";
                if (type == typeof(uint)) return "number";
                if (type == typeof(short)) return "number";
                if (type == typeof(byte)) return "number";
                if (type == typeof(sbyte)) return "number";
                if (type == typeof(char)) return "number";
                if (type == typeof(ushort)) return "number";
                if (type == typeof(bool)) return "boolean";
                if (type == typeof(long)) return "bigint";
                if (type == typeof(ulong)) return "bigint";
                if (type == typeof(float)) return "number";
                if (type == typeof(double)) return "number";
                if (type == typeof(string)) return "string";
                if (type == typeof(void)) return "void";
                if (type == typeof(ArrayBuffer)) return "ArrayBuffer";
                if (type == typeof(object)) return "any";
                if (type == typeof(Delegate) || type == typeof(GenericDelegate)) return "Function";
#if CSHARP_7_3_OR_NEWER
                if (type == typeof(Task)) return "$Task<any>";
#endif
                if (type.IsByRef) return "$Ref<" + GetTsTypeName(type.GetElementType()) + ">";
                if (type.IsArray)
                    return isParams ? GetTsTypeName(type.GetElementType()) + "[]"
                            : "System.Array$1<" + GetTsTypeName(type.GetElementType()) + ">";

                if (type.IsGenericType) {
                    var underlyingType = Nullable.GetUnderlyingType(type);
                    if (underlyingType != null) return GetTsTypeName(underlyingType) + " | null";
                    var fullName = type.FullName == null ? type.ToString() : type.FullName;
                    var parts = fullName.Replace('+', '.').Split('`');
                    var argTypenames = type.GetGenericArguments()
                            .Select(x => GetTsTypeName(x))
                            .ToArray();
                    return parts[0]
                            + '$'
                            + parts[1].Split('[')[0]
                            + "<"
                            + string.Join(", ", argTypenames)
                            + ">";
                }
                if (type.FullName == null) return type.ToString();
                return type.FullName.Replace('+', '.');
            }

            public static Type GetRawType(Type type)
            {
                if (type.IsByRef || type.IsArray) return GetRawType(type.GetElementType());
                if (type.IsGenericType) return type.GetGenericTypeDefinition();
                return type;
            }
        }
    }
}
