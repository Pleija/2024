/*
 * Tencent is pleased to support the open source community by making Puerts available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
 * Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms.
 * This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
 */

#if !EXPERIMENTAL_IL2CPP_PUERTS || !ENABLE_IL2CPP

#region
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
#endregion

namespace Puerts
{
    public class LazyMembersWrap
    {
        protected Type definitionType;

        protected BindingFlags flag = BindingFlags.DeclaredOnly
                | BindingFlags.Instance
                | BindingFlags.Static
                | BindingFlags.Public;

        protected JsEnv jsEnv;
        protected string memberName;

        public LazyMembersWrap(string memberName, JsEnv jsEnv, Type definitionType)
        {
            this.memberName = memberName;
            this.jsEnv = jsEnv;
            this.definitionType = definitionType;
        }
    }

    public class LazyFieldWrap : LazyMembersWrap
    {
        private JSFunctionCallback Getter;
        private JSFunctionCallback Setter;

        public LazyFieldWrap(string memberName, JsEnv jsEnv, Type definitionType) : base(memberName,
            jsEnv, definitionType) { }

        public void InvokeSetter(IntPtr isolate, IntPtr info, IntPtr self, int argumentsLen)
        {
            if (Getter == null) {
                var field = definitionType.GetField(memberName, flag);
                Getter = GenFieldGetter(definitionType, field);
                if (!field.IsInitOnly && !field.IsLiteral)
                    Setter = GenFieldSetter(definitionType, field);
            }
            if (Setter != null) Setter(isolate, info, self, argumentsLen);
        }

        public void InvokeGetter(IntPtr isolate, IntPtr info, IntPtr self, int argumentsLen)
        {
            if (Getter == null) {
                var field = definitionType.GetField(memberName, flag);
                Getter = GenFieldGetter(definitionType, field);
                if (!field.IsInitOnly && !field.IsLiteral)
                    Setter = GenFieldSetter(definitionType, field);
            }
            Getter(isolate, info, self, argumentsLen);
        }

        private JSFunctionCallback GenFieldGetter(Type type, FieldInfo field)
        {
            var translateFunc = jsEnv.GeneralSetterManager.GetTranslateFunc(field.FieldType);
            if (field.IsStatic)
                return (isolate, info, self, argumentsLen) => {
                    translateFunc(jsEnv.Idx, isolate, NativeValueApi.SetValueToResult, info,
                        field.GetValue(null));
                };
            return (isolate, info, self, argumentsLen) => {
                var me = jsEnv.GeneralGetterManager.GetSelf(jsEnv.Idx, self);
                translateFunc(jsEnv.Idx, isolate, NativeValueApi.SetValueToResult, info,
                    field.GetValue(me));
            };
        }

        private JSFunctionCallback GenFieldSetter(Type type, FieldInfo field)
        {
            var translateFunc = jsEnv.GeneralGetterManager.GetTranslateFunc(field.FieldType);
            var typeMask = GeneralGetterManager.GetJsTypeMask(field.FieldType);
            if (field.IsStatic)
                return (isolate, info, self, argumentsLen) => {
                    var valuePtr = PuertsDLL.GetArgumentValue(info, 0);
                    var valueType = PuertsDLL.GetJsValueType(isolate, valuePtr, false);
                    object value = null;

                    if (!Utils.IsJsValueTypeMatchType(valueType, field.FieldType, typeMask, () => {
                        value = translateFunc(jsEnv.Idx, isolate,
                            NativeValueApi.GetValueFromArgument, valuePtr,
                            false);
                        return value;
                    }, value)) {
                        PuertsDLL.ThrowException(isolate,
                            "expect " + typeMask + " but got " + valueType);
                    }
                    else {
                        if (value == null)
                            value = translateFunc(jsEnv.Idx, isolate,
                                NativeValueApi.GetValueFromArgument, valuePtr,
                                false);
                        field.SetValue(null, value);
                    }
                };
            return (isolate, info, self, argumentsLen) => {
                var valuePtr = PuertsDLL.GetArgumentValue(info, 0);
                var valueType = PuertsDLL.GetJsValueType(isolate, valuePtr, false);
                object value = null;

                if (!Utils.IsJsValueTypeMatchType(valueType, field.FieldType, typeMask, () => {
                    value = translateFunc(jsEnv.Idx, isolate, NativeValueApi.GetValueFromArgument,
                        valuePtr, false);
                    return value;
                }, value)) {
                    PuertsDLL.ThrowException(isolate,
                        "expect " + typeMask + " but got " + valueType);
                }
                else {
                    var me = jsEnv.GeneralGetterManager.GetSelf(jsEnv.Idx, self);
                    field.SetValue(me,
                        translateFunc(jsEnv.Idx, isolate, NativeValueApi.GetValueFromArgument,
                            valuePtr, false));
                }
            };
        }
    }

    public class LazyPropertyWrap : LazyMembersWrap
    {
        protected MethodReflectionWrap reflectionWrap;

        public LazyPropertyWrap(string memberName, JsEnv jsEnv, Type definitionType) : base(
            memberName, jsEnv, definitionType) { }

        public void Invoke(IntPtr isolate, IntPtr info, IntPtr self, int argumentsLen)
        {
            try {
                if (reflectionWrap == null) {
                    var xetMethodInfo = definitionType.GetMethod(memberName, flag);
                    reflectionWrap = new MethodReflectionWrap(memberName,
                        new List<OverloadReflectionWrap> {
                            new OverloadReflectionWrap(xetMethodInfo, jsEnv),
                        });
                }
                reflectionWrap.Invoke(isolate, info, self, argumentsLen);
            }
            catch (Exception e) {
                PuertsDLL.ThrowException(isolate,
                    "c# exception:" + e.Message + ",stack:" + e.StackTrace);
            }
        }
    }

    public class LazyMethodWrap : LazyMembersWrap
    {
        protected MethodReflectionWrap reflectionWrap;

        public LazyMethodWrap(string memberName, JsEnv jsEnv, Type definitionType) : base(
            memberName, jsEnv, definitionType) { }

        public void Invoke(IntPtr isolate, IntPtr info, IntPtr self, int argumentsLen)
        {
            try {
                if (reflectionWrap == null) {
                    var overload = Utils.GetMethodAndOverrideMethodByName(
                        definitionType, memberName);
                    reflectionWrap = new MethodReflectionWrap(memberName,
                        overload.Select(m => new OverloadReflectionWrap(m, jsEnv)).ToList());
                }
                reflectionWrap.Invoke(isolate, info, self, argumentsLen);
            }
            catch (Exception e) {
                PuertsDLL.ThrowException(isolate,
                    "c# exception:" + e.Message + ",stack:" + e.StackTrace);
            }
        }
    }
}

#endif
