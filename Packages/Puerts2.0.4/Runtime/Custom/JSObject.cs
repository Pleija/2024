/*
 * Tencent is pleased to support the open source community by making Puerts available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
 * Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms.
 * This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
 */

#if !EXPERIMENTAL_IL2CPP_PUERTS || !ENABLE_IL2CPP
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Newtonsoft.Json;
using UnityEngine;

namespace Puerts
{
    internal class JSObjectFactory
    {
        private Dictionary<IntPtr, WeakReference> nativePtrToJSObject = new Dictionary<IntPtr, WeakReference>();

        public JSObject GetOrCreateJSObject(IntPtr ptr, JsEnv jsEnv)
        {
            WeakReference maybeOne;

            if (nativePtrToJSObject.TryGetValue(ptr, out maybeOne) && maybeOne.IsAlive) {
                return maybeOne.Target as JSObject;
            }
            JSObject jsObject = new JSObject(ptr, jsEnv);
            nativePtrToJSObject[ptr] = new WeakReference(jsObject);
            return jsObject;
        }

        public void RemoveJSObject(IntPtr ptr)
        {
            WeakReference maybeOne;

            if (nativePtrToJSObject.TryGetValue(ptr, out maybeOne) && !maybeOne.IsAlive) {
                nativePtrToJSObject.Remove(ptr);
            }
        }

        internal bool IsJsObjectAlive(IntPtr ptr)
        {
            WeakReference maybeOne;
            return nativePtrToJSObject.TryGetValue(ptr, out maybeOne) && maybeOne.IsAlive;
        }
    }

    public static class JsObjectHelper
    {
        public static string[] Keys(this JSObject jsObject)
        {
            var keys = new List<string>();
            jsObject.Safe?.jsEnv.Eval<Action<object, Action<string>>>("(o,fn) => Object.keys(o).map(t => fn.Invoke(t))")
                .Invoke(jsObject, t => keys.Add(t));

            return keys.ToArray();
        }


        public static Dictionary<string, object> Map(this JSObject jsObject) => Map<object>(jsObject);

        public static Dictionary<string, T> Map<T>(this JSObject jsObject)
        {
            return jsObject.Safe?.Keys().ToDictionary(t => t, jsObject.Get<T>) ?? new Dictionary<string, T>();
        }
    }

    public class JSObject
    {
        internal readonly JsEnv jsEnv;
        private IntPtr nativeJsObjectPtr;

        public IntPtr getJsObjPtr()
        {
            return nativeJsObjectPtr;
        }

        internal JSObject(IntPtr nativeJsObjectPtr, JsEnv jsEnv)
        {
            this.nativeJsObjectPtr = nativeJsObjectPtr;
            this.jsEnv = jsEnv;
            jsEnv.IncJSObjRef(nativeJsObjectPtr);
        }

        public T Get<T>(string key)
        {
            return jsEnv.JSObjectValueGetter.Func<JSObject, string, T>(this, key);
        }

        public bool IsAlive => jsEnv is { disposed: false };
        public JSObject Safe => IsAlive ? this : null;

        public override string ToString()
        {
            return JsonConvert.SerializeObject(Safe.Map());
        }

        ~JSObject()
        {
#if THREAD_SAFE
            lock(jsEnv) 
            {
#endif
            jsEnv.DecJSObjRef(nativeJsObjectPtr);
#if THREAD_SAFE
            }
#endif
        }
    }
}

#endif
