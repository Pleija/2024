﻿using System;
using System.Collections.Generic;
using System.Linq;

namespace ParadoxNotion.Serialization.FullSerializer
{
    ///<summary> The serialization converter allows for customization of the serialization process.</summary>
    public abstract class fsBaseConverter
    {
        ///<summary> The serializer that owns this converter.</summary>
        public fsSerializer Serializer;

        /// <summary>
        ///     Construct an object instance that will be passed to TryDeserialize. This should **not** deserialize the
        ///     object.
        /// </summary>
        public virtual object CreateInstance(fsData data, Type storageType)
        {
            if (RequestCycleSupport(storageType))
                throw new InvalidOperationException("Please override CreateInstance for " + GetType().FullName +
                    "; the object graph for " + storageType +
                    " can contain potentially contain cycles, so separated instance creation " + "is needed");
            return storageType;
        }

        ///<summary> If true, then the serializer will support cyclic references with the given converted type.</summary>
        public virtual bool RequestCycleSupport(Type storageType)
        {
            if (storageType == typeof(string)) return false;
            return storageType.IsClass || storageType.IsInterface;
        }

        ///<summary> If true, then the serializer will include inheritance data for the given converter.</summary>
        public virtual bool RequestInheritanceSupport(Type storageType) => storageType.IsSealed == false;

        ///<summary> Serialize the actual object into the given data storage.</summary>
        public abstract fsResult TrySerialize(object instance, out fsData serialized, Type storageType);

        ///<summary> Deserialize data into the object instance.</summary>
        public abstract fsResult TryDeserialize(fsData data, ref object instance, Type storageType);

        protected fsResult FailExpectedType(fsData data, params fsDataType[] types)
        {
            return fsResult.Fail(GetType().Name + " expected one of " +
                string.Join(", ", types.Select(t => t.ToString()).ToArray()) + " but got " + data.Type + " in " + data);
        }

        protected fsResult CheckType(fsData data, fsDataType type)
        {
            if (data.Type != type)
                return fsResult.Fail(GetType().Name + " expected " + type + " but got " + data.Type + " in " + data);
            return fsResult.Success;
        }

        protected fsResult CheckKey(fsData data, string key, out fsData subitem) =>
            CheckKey(data.AsDictionary, key, out subitem);

        protected fsResult CheckKey(Dictionary<string, fsData> data, string key, out fsData subitem)
        {
            if (data.TryGetValue(key, out subitem) == false)
                return fsResult.Fail(GetType().Name + " requires a <" + key + "> key in the data " + data);
            return fsResult.Success;
        }

        protected fsResult SerializeMember<T>(Dictionary<string, fsData> data, Type overrideConverterType, string name,
            T value)
        {
            fsData memberData;
            var result = Serializer.TrySerialize(typeof(T), value, out memberData, overrideConverterType);
            if (result.Succeeded) data[name] = memberData;
            return result;
        }

        protected fsResult DeserializeMember<T>(Dictionary<string, fsData> data, Type overrideConverterType,
            string name, out T value)
        {
            fsData memberData;

            if (data.TryGetValue(name, out memberData) == false) {
                value = default;
                return fsResult.Fail("Unable to find member \"" + name + "\"");
            }
            object storage = null;
            var result = Serializer.TryDeserialize(memberData, typeof(T), ref storage, overrideConverterType);
            value = (T)storage;
            return result;
        }
    }
}
