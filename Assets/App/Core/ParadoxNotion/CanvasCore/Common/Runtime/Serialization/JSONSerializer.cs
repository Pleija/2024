#region
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using ParadoxNotion.Serialization.FullSerializer;
using ParadoxNotion.Serialization.FullSerializer.Internal;
using ParadoxNotion.Services;
using UnityEngine;
using Logger = ParadoxNotion.Services.Logger;
using Object = UnityEngine.Object;
#endregion

namespace ParadoxNotion.Serialization
{
    /// <summary>
    ///     High-Level API. Serializes/Deserializes to/from JSON with a heavily modified
    ///     'FullSerializer'
    /// </summary>
    public static class JSONSerializer
    {
        private static object serializerLock;
        private static fsSerializer serializer;
        private static Dictionary<string, fsData> dataCache;

        static JSONSerializer()
        {
            serializerLock = new object();
            FlushMem();
        }

        public static void FlushMem()
        {
            serializer = new fsSerializer();
            dataCache = new Dictionary<string, fsData>();
            fsMetaType.FlushMem();
        }

#if UNITY_2019_3_OR_NEWER
        //for "no domain reload"
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        private static void __FlushDataCache()
        {
            dataCache = new Dictionary<string, fsData>();
        }
#endif

        ///----------------------------------------------------------------------------------------------
        ///<summary>Serialize to json</summary>
        public static string Serialize(Type type, object instance, List<Object> references = null,
            bool pretyJson = false)
        {
            lock (serializerLock) {
                serializer.PurgeTemporaryData();
                serializer.ReferencesDatabase = references;
                fsData data;
                //We override the UnityObject converter if we serialize a UnityObject directly.
                //UnityObject converter will still be used for every serialized property found within the object though.
                var overrideConverterType = typeof(Object).RTIsAssignableFrom(type)
                        ? typeof(fsReflectedConverter) : null;
                var r = serializer.TrySerialize(type, instance, out data, overrideConverterType)
                        .AssertSuccess();
                if (r.HasWarnings) Logger.LogWarning(r.ToString(), "Serialization");
                serializer.ReferencesDatabase = null;
                var json = fsJsonPrinter.ToJson(data, pretyJson);
                if (Threader.applicationIsPlaying || Application.isPlaying) dataCache[json] = data;
                return json;
            }
        }

        ///----------------------------------------------------------------------------------------------
        ///<summary>Deserialize from json</summary>
        public static T Deserialize<T>(string json, List<Object> references = null) =>
                (T)Internal_Deserialize(typeof(T), json, references, null);

        ///<summary>Deserialize from json</summary>
        public static object Deserialize(Type type, string json, List<Object> references = null) =>
                Internal_Deserialize(type, json, references, null);

        ///<summary>Deserialize overwrite from json</summary>
        public static T TryDeserializeOverwrite<T>(T instance, string json,
            List<Object> references = null) where T : class =>
                (T)Internal_Deserialize(typeof(T), json, references, instance);

        ///<summary>Deserialize overwrite from json</summary>
        public static object TryDeserializeOverwrite(object instance, string json,
            List<Object> references = null) =>
                Internal_Deserialize(instance.GetType(), json, references, instance);

        ///<summary>Deserialize from json</summary>
        private static object Internal_Deserialize(Type type, string json, List<Object> references,
            object instance)
        {
            lock (serializerLock) {
                serializer.PurgeTemporaryData();
                fsData data = null;

                if (Threader.applicationIsPlaying) {
                    //caching is useful only in playmode realy since editing is finalized
                    if (!dataCache.TryGetValue(json, out data))
                        dataCache[json] = data = fsJsonParser.Parse(json);
                }
                else {
                    //in editor we just parse it
                    data = fsJsonParser.Parse(json);
                }
                serializer.ReferencesDatabase = references;
                //We use Reflected converter if we deserialize overwrite a UnityObject directly.
                //UnityObject converter will still be used for every serialized property found within the object though.
                var overrideConverterType =
                        instance is Object ? typeof(fsReflectedConverter) : null;
                var r = serializer.TryDeserialize(data, type, ref instance, overrideConverterType)
                        .AssertSuccess();
                if (r.HasWarnings) Logger.LogWarning(r.ToString(), "Serialization");
                serializer.ReferencesDatabase = null;
                return instance;
            }
        }

        /// <summary>
        ///     Serialize instance without cycle refs support and execute call per object serialized within
        ///     along with it's
        ///     serialization data
        /// </summary>
        public static void SerializeAndExecuteNoCycles(Type type, object instance,
            Action<object, fsData> call)
        {
            lock (serializerLock) {
                serializer.IgnoreSerializeCycleReferences = true;
                serializer.onAfterObjectSerialized += call;

                try {
                    Serialize(type, instance);
                }
                finally {
                    serializer.IgnoreSerializeCycleReferences = false;
                    serializer.onAfterObjectSerialized -= call;
                }
            }
        }

        /// <summary>
        ///     Serialize instance without cycle refs support and execute before/after call per object
        ///     serialized within along
        ///     with it's serialization data
        /// </summary>
        public static void SerializeAndExecuteNoCycles(Type type, object instance,
            Action<object> beforeCall, Action<object, fsData> afterCall)
        {
            lock (serializerLock) {
                serializer.IgnoreSerializeCycleReferences = true;
                serializer.onBeforeObjectSerialized += beforeCall;
                serializer.onAfterObjectSerialized += afterCall;

                try {
                    Serialize(type, instance);
                }
                finally {
                    serializer.IgnoreSerializeCycleReferences = false;
                    serializer.onBeforeObjectSerialized -= beforeCall;
                    serializer.onAfterObjectSerialized -= afterCall;
                }
            }
        }

        ///<summary>Deep clone an object</summary>
        public static T Clone<T>(T original) => (T)Clone((object)original);

        ///<summary>Deep clone an object</summary>
        public static object Clone(object original)
        {
            var type = original.GetType();
            var references = new List<Object>();
            var json = Serialize(type, original, references);
            return Deserialize(type, json, references);
        }

        ///<summary>Serialize source and overwrites target</summary>
        public static void CopySerialized(object source, object target)
        {
            var type = source.GetType();
            var references = new List<Object>();
            var json = Serialize(type, source, references);
            TryDeserializeOverwrite(target, json, references);
        }

        ///<summary>Writes json to prety json in a temp file and opens it</summary>
        public static void ShowData(string json, string fileName = "")
        {
            var prettyJson = PrettifyJson(json);
            var dataPath = Path.GetTempPath()
                    + (string.IsNullOrEmpty(fileName) ? Guid.NewGuid().ToString() : fileName)
                    + ".json";
            File.WriteAllText(dataPath, prettyJson);
            Process.Start(dataPath);
        }

        ///<summary>Prettify existing json string</summary>
        public static string PrettifyJson(string json) =>
                fsJsonPrinter.PrettyJson(fsJsonParser.Parse(json));
    }
}
