#region
using System;
using ParadoxNotion;
using UnityEngine;
#endregion

namespace NodeCanvas.Framework.Internal
{
    ///<summary>Can be set to any type in case type is unknown.</summary>
    [Serializable]
    public class BBObjectParameter : BBParameter<object>, ISerializationCallbackReceiver
    {
        [SerializeField]
        private string _type;

        public BBObjectParameter()
        {
            SetType(typeof(object));
        }

        public BBObjectParameter(Type t)
        {
            SetType(t);
        }

        public BBObjectParameter(BBParameter source)
        {
            if (source != null) {
                type = source.varType;
                _value = source.value;
                name = source.name;
                targetVariableID = source.targetVariableID;
            }
        }

        private Type type { get; set; }
        public override Type varType => type != null ? type : typeof(object);

        void ISerializationCallbackReceiver.OnBeforeSerialize()
        {
            if (type != null) _type = type.FullName;
        }

        void ISerializationCallbackReceiver.OnAfterDeserialize()
        {
            type = ReflectionTools.GetType(_type, /*fallback?*/ true);
        }

        public void SetType(Type t)
        {
            if (t == null) t = typeof(object);
            if (t != type || (t.RTIsValueType() && _value == null))
                _value = t.RTIsValueType() ? Activator.CreateInstance(t) : null;
            type = t;
        }
    }
}
