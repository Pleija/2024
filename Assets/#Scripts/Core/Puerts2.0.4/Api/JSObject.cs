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
using JetBrains.Annotations;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Zu.TypeScript.TsTypes;
using Type = System.Type;

namespace Puerts
{
    internal class JSObjectFactory
    {
        private Dictionary<IntPtr, WeakReference> nativePtrToJSObject =
            new Dictionary<IntPtr, WeakReference>();

        public JSObject GetOrCreateJSObject(IntPtr ptr, JsEnv jsEnv)
        {
            WeakReference maybeOne;
            if (nativePtrToJSObject.TryGetValue(ptr, out maybeOne) && maybeOne.IsAlive)
                return maybeOne.Target as JSObject;
            var jsObject = new JSObject(ptr, jsEnv);
            nativePtrToJSObject[ptr] = new WeakReference(jsObject);
            return jsObject;
        }

        public void RemoveJSObject(IntPtr ptr)
        {
            WeakReference maybeOne;
            if (nativePtrToJSObject.TryGetValue(ptr, out maybeOne) && !maybeOne.IsAlive)
                nativePtrToJSObject.Remove(ptr);
        }

        internal bool IsJsObjectAlive(IntPtr ptr)
        {
            WeakReference maybeOne;
            return nativePtrToJSObject.TryGetValue(ptr, out maybeOne) && maybeOne.IsAlive;
        }
    }

    public class JsObjectConverter : JsonConverter
    {
        // omitted for brevity
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            switch (value) {
                case null:
                    writer.WriteNull();
                    break;
                case JSObject jsObject:
                    writer.WriteRaw(jsObject.jsEnv
                        .Eval<Func<JSObject, string>>("o => JSON.stringify(o)").Invoke(jsObject));
                    // if (jsObject.IsArray()) {
                    //     ParseArray(jsObject).WriteTo(writer);
                    // }
                    // else
                    //     Parse(jsObject).WriteTo(writer);
                    break;
                default: throw new JsonSerializationException("Expected JsObject object value");
            }
        }

        private static JArray ParseArray(JSObject jsObject)
        {
            var arr = new JArray();
            var count = jsObject.jsEnv.Eval<Func<JSObject, int>>("o => o.length").Invoke(jsObject);

            for (var i = 0; i < count; i++) {
                var type = jsObject.jsEnv.Eval<Func<JSObject, int, string>>("(o,i)=>typeof o[i]")
                    .Invoke(jsObject, i);

                if (type == "number") {
                    arr.Add(jsObject.jsEnv.Eval<Func<JSObject, int, float>>("(o,i)=>o[i]")
                        .Invoke(jsObject, i));
                    continue;
                }

                if (type == "string") {
                    arr.Add(jsObject.jsEnv.Eval<Func<JSObject, int, string>>("(o,i)=>o[i]")
                        .Invoke(jsObject, i));
                    continue;
                }

                if (type == "boolean") {
                    arr.Add(jsObject.jsEnv.Eval<Func<JSObject, int, bool>>("(o,i)=>o[i]")
                        .Invoke(jsObject, i));
                    continue;
                }
                if (type == "function") continue;
                var v = jsObject.jsEnv.Eval<Func<JSObject, int, JSObject>>("(o,i)=>o[i]")
                    .Invoke(jsObject, i);
                if (v.IsArray())
                    arr.Add(ParseArray(v));
                else
                    arr.Add(Parse(v));
            }
            return arr;
        }

        private static JObject Parse(JSObject jsObject)
        {
            var jo = new JObject();

            foreach (var kvp in jsObject.Map())
                if (kvp.Value is JSObject js) {
                    if (js.IsArray())
                        jo.Add(kvp.Key, ParseArray(js));
                    else
                        jo.Add(kvp.Key, Parse(js));
                }
                else {
                    jo.Add(new JProperty(kvp.Key, kvp.Value));
                }
            return jo;
        }

        [CanBeNull]
        public override object ReadJson(JsonReader reader, Type objectType,
            [CanBeNull] object existingValue, JsonSerializer serializer)
        {
            if (reader.TokenType == JsonToken.Null) return null;
            return Js.Call<JSObject>("s => JSON.parse(s)", reader.Value);
        }

        public override bool CanConvert(Type objectType) => objectType == typeof(JSObject);
        public override bool CanWrite => true;
        public override bool CanRead => true;
    }

    // public class JsObjectConverter : JsonCreationConverter<JSObject>
    // {
    //     public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer) { }
    //
    //     protected override JSObject Create(Type objectType, JObject jObject)
    //     {
    //
    //     };
    // }
    //
    // public abstract class JsonCreationConverter<T> : JsonConverter
    // {
    //     /// <summary>
    //     /// Create an instance of objectType, based properties in the JSON object
    //     /// </summary>
    //     /// <param name="objectType">type of object expected</param>
    //     /// <param name="jObject">
    //     /// contents of JSON object that will be deserialized
    //     /// </param>
    //     /// <returns></returns>
    //     protected abstract T Create(Type objectType, JObject jObject);
    //
    //     public override bool CanConvert(Type objectType)
    //     {
    //         return typeof(T).IsAssignableFrom(objectType);
    //     }
    //
    //     public override bool CanWrite
    //     {
    //         get { return false; }
    //     }
    //
    //     public override object ReadJson(JsonReader reader, 
    //         Type objectType, 
    //         object existingValue, 
    //         JsonSerializer serializer)
    //     {
    //         // Load JObject from stream
    //         JObject jObject = JObject.Load(reader);
    //
    //         // Create target object based on JObject
    //         T target = Create(objectType, jObject);
    //
    //         // Populate the object properties
    //         serializer.Populate(jObject.CreateReader(), target);
    //
    //         return target;
    //     }
    // }
    public static class JsObjectHelper { }

    public class JSObject
    {
        // internal readonly 
        private JsEnv _env;

        internal JsEnv jsEnv {
            get => _env is { disposed: false } ? _env : throw new Exception("JsEnv Disposed");
            set => _env = value;
        }

        private IntPtr nativeJsObjectPtr;

        public IntPtr getJsObjPtr() =>
            jsEnv is { disposed: false } ? nativeJsObjectPtr : IntPtr.Zero;

        internal JSObject(IntPtr nativeJsObjectPtr, JsEnv jsEnv)
        {
            this.nativeJsObjectPtr = nativeJsObjectPtr;
            this.jsEnv = jsEnv;
            jsEnv.IncJSObjRef(nativeJsObjectPtr);
        }

        public T Get<T>(string key) =>
            jsEnv.JSObjectValueGetter.Func<JSObject, string, T>(this, key);

        public bool IsAlive => jsEnv is { disposed: false };
        public JSObject Safe => IsAlive ? this : null;
        public T[] ToArray<T>() => ((object[])this).Cast<T>().ToArray();

        public static implicit operator object[](JSObject value)
        {
            if (value.Safe == null || value.IsArray() != true) return Array.Empty<object>();
            return value.jsEnv
                .Eval<Func<JSObject, object[]>>(
                    "o => CS.UnityApi.CreateArray(puer.$typeof(CS.System.Object),...o)")
                .Invoke(value);
        }

        public override string ToString() =>
            jsEnv.Eval<Func<JSObject, string>>("o => JSON.stringify(o)").Invoke(this);

        //JsonConvert.SerializeObject(Safe, new JsObjectConverter());
        public string[] Keys()
        {
            var keys = new List<string>();
            jsEnv.Eval<Action<object, Action<string>>>(
                "(o,fn) => Object.keys(o).map(t => fn.Invoke(t))").Invoke(this, t => keys.Add(t));
            return keys.ToArray();
        }

        public Dictionary<string, object> Map() => Map<object>();

        public Dictionary<string, T> Map<T>()
        {
            return Keys().ToDictionary(t => t, Get<T>) ?? new Dictionary<string, T>();
        }

        public bool IsArray() =>
            jsEnv.Eval<Func<JSObject, bool>>("o => Array.isArray(o)").Invoke(this);

        ~JSObject()
        {
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            jsEnv.DecJSObjRef(nativeJsObjectPtr);
#if THREAD_SAFE
            }
#endif
        }
    }
}
#endif
