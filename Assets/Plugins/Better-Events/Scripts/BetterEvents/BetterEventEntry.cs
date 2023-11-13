using Sirenix.Serialization;
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace BetterEvents
{
    [Serializable]
    public class BetterEventEntry : ISerializationCallbackReceiver
    {
        [NonSerialized]
        [HideInInspector]
        public Delegate Delegate;

        [NonSerialized]
        [HideInInspector]
        public object[] ParameterValues;

        //public object Result;

        public BetterEventEntry(Delegate del) {
            if (del != null && del.Method != null) {
                Delegate = del;
                ParameterValues = new object[del.Method.GetParameters().Length];
            }
        }

        public void Invoke() {
            if (Delegate != null && ParameterValues != null)

                // This is faster than Dynamic Invoke.
                /*this.Result = */
                Delegate.Method.Invoke(Delegate.Target, ParameterValues);
        }

    #region OdinSerialization

        [SerializeField]
        [HideInInspector]
        List<UnityEngine.Object> unityReferences;

        [SerializeField]
        [HideInInspector]
        byte[] bytes;

        public void OnAfterDeserialize() {
            var val = SerializationUtility.DeserializeValue<OdinSerializedData>(bytes, DataFormat.Binary,
                unityReferences);

            Delegate = val.Delegate;
            ParameterValues = val.ParameterValues;
        }

        public void OnBeforeSerialize() {
            var val = new OdinSerializedData() { Delegate = Delegate, ParameterValues = ParameterValues };
            bytes = SerializationUtility.SerializeValue(val, DataFormat.Binary, out unityReferences);
        }

        struct OdinSerializedData
        {
            public Delegate Delegate;
            public object[] ParameterValues;
        }

    #endregion
    }
}
