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
using JetBrains.Annotations;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Sirenix.Serialization;
using Sirenix.Utilities;
using Type = System.Type;
#endregion

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
        public override bool CanWrite => true;
        public override bool CanRead => true;

        // omitted for brevity
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            switch (value) {
                case null:
                    writer.WriteNull();
                    break;
                case JSObject jsObject:
                    // writer.WriteRaw(jsObject.jsEnv
                    //         .Eval<Func<JSObject, string>>("o => JSON.stringify(o)")
                    //         .Invoke(jsObject));
                    if (jsObject.isArray) {
                        ParseArray(jsObject).WriteTo(writer);
                    }
                    else
                        Parse(jsObject).WriteTo(writer);
                    break;
                default: throw new JsonSerializationException("Expected JsObject object value");
            }
        }

        private static JArray ParseArray(JSObject jsObject)
        {
            var arr = new JArray();
            var count = jsObject.length;

            for (var i = 0; i < count; i++) {
                var type = jsObject.GetType(i);

                if (type == "number") {
                    arr.Add(jsObject.Get<float>(i));
                    continue;
                }

                if (type == "string") {
                    arr.Add(jsObject.Get<string>(i));
                    continue;
                }

                if (type == "boolean") {
                    arr.Add(jsObject.Get<bool>(i));
                    continue;
                }
                if (type == "function") continue;
                var v = jsObject.Get<JSObject>(i);
                if (v.isArray)
                    arr.Add(ParseArray(v));
                else
                    arr.Add(Parse(v));
            }
            return arr;
        }

        private static JObject Parse(JSObject jsObject)
        {
            var jo = new JObject();

            if (jsObject.csType is { } csType) {
                jo.Add("data:"
                    + Convert.ToBase64String(SerializationUtility.SerializeValue(
                        jsObject.jsEnv.Eval<Func<JSObject, object>>("o => o").Invoke(jsObject),
                        DataFormat.Binary)));
                return jo;
            }

            foreach (var kvp in jsObject.Map())
                if (kvp.Value is JSObject js) {
                    if (js.isArray)
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
            return JsEnv.self.Call<JSObject>("s => JSON.parse(s)", reader.Value);
        }

        public override bool CanConvert(Type objectType) => objectType == typeof(JSObject);
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
        private IntPtr nativeJsObjectPtr;

        internal JSObject(IntPtr nativeJsObjectPtr, JsEnv jsEnv)
        {
            this.nativeJsObjectPtr = nativeJsObjectPtr;
            this.jsEnv = jsEnv;
            jsEnv.IncJSObjRef(nativeJsObjectPtr);
        }

        internal JsEnv jsEnv {
            get => _env is { disposed: false } ? _env : throw new Exception("JsEnv Disposed");
            set => _env = value;
        }

        public bool IsAlive => jsEnv is { disposed: false };
        public JSObject Safe => IsAlive ? this : null;

        public IntPtr getJsObjPtr() =>
            jsEnv is { disposed: false } ? nativeJsObjectPtr : IntPtr.Zero;

        public int length => jsEnv.Call<int>("o => o.length", this);
        public Type csType => jsEnv.Call<Type>("(o)=>puer.$typeof(o)", this);

        public Type GetCsType(int i) => jsEnv
            .Call<Type>("(o,i)=>puer.$typeof(o[i])", this, i);

        public string GetType(int i) => jsEnv.Call<string>("(o,i)=>typeof o[i]", this, i);
        private string _type;

        public string type {
            get {
                if (_type.IsNullOrEmpty()) _type = jsEnv.Call<string>("o => typeof o", this);
                return _type;
            }
        }

        public T Cast<T>() => jsEnv.Call<T>("o => o", this);

        public T Get<T>(string key) =>
            jsEnv.JSObjectValueGetter.Func<JSObject, string, T>(this, key);

        public T Get<T>(int key) => jsEnv.Call<T>("(o,i) => o.length > i ? o[i] : null", this, key);
        public T[] ToArray<T>() => ToArray().Cast<T>().ToArray();

        public object[] ToArray()
        {
            if (Safe == null || isArray != true) return Array.Empty<object>();
            return jsEnv.Call<object[]>(
                "o => CS.UnityApi.CreateArray(puer.$typeof(CS.System.Object),...o)", this);
        }

        public bool isNumber => type == "number" || type == "bigint";
        public bool isBoolean => type == "boolean";
        public bool isFunction => type == "function";
        public bool isCsObject => type == "object" && csType != null;

        public bool isInteger =>
            (type == "number" && Cast<double>().IsInteger()) || type == "bigint";

        public bool isObject => type == "object" && !isArray && csType == null;

        // public static explicit operator double(JSObject jsObject)
        // {
        //
        // }
        public static implicit operator object[](JSObject value) => value.ToArray();

        public override string ToString()
        {
            if (type == "object") {
                return JsonConvert.SerializeObject(this);
            }
            return jsEnv.Call<string>("o => JSON.stringify(o)", this);
        }

        //JsonConvert.SerializeObject(Safe, new JsObjectConverter());
        public string[] Keys()
        {
            var keys = new List<string>();
            jsEnv.Call("(o,list) => Object.keys(o).map(t => list.Add(t))", this, keys);
            return keys.ToArray();
        }

        public object GetValue()
        {
            switch (type) {
                case "undefined": return null;
                case "boolean":   return Cast<bool>();
                case "function":  return Cast<Delegate>();
                case "bigint":    return Cast<long>();
                case "number":    return isInteger ? Cast<int>() : Cast<double>();
                case "string":    return Cast<string>();
                case "object":
                    if (isCsObject) return Cast<object>();

                    if (isArray) {
                        var ret = new List<object>();

                        for (int i = 0; i < length; i++) {
                            ret.Add(Get<JSObject>(i).GetValue());
                        }
                        return ret.ToArray();
                    }
                    var dict = new Dictionary<string, object>();
                    Keys()
                        .ForEach(k => dict.Add(k,
                            jsEnv.Call<JSObject>("(o,name) => o[name]", this, k).GetValue()));
                    return dict;
                    break;
                default: return null;
            }
            return null;
        }

        public Dictionary<string, object> Map() => Map<object>();

        public Dictionary<string, T> Map<T>()
        {
            return Keys().ToDictionary(t => t, Get<T>) ?? new Dictionary<string, T>();
        }

        public bool isArray => jsEnv.Call<bool>("o => Array.isArray(o)", this);

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
