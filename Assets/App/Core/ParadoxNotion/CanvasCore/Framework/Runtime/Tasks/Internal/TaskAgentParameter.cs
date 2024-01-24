#region
using System;
using ParadoxNotion.Serialization.FullSerializer;
using UnityEngine;
using Object = UnityEngine.Object;
#endregion

namespace NodeCanvas.Framework.Internal
{
    /// <summary>
    ///     A special BBParameter for the task agent used in Task. This should be a nested class of Task,
    ///     but WSA has a
    ///     bug in doing so. Remark: BBParameter has fsAutoInstance, but we exclude this from being auto
    ///     instanced!
    /// </summary>
    [Serializable, fsAutoInstance(false)]
    public sealed class TaskAgentParameter : BBParameter<Object>
    {
        [SerializeField]
        private Type _type;

        public override Type varType => _type ?? typeof(Object);

        public new Object value {
            get {
                var o = base.value;
                if (o is GameObject) return (o as GameObject).transform;
                if (o is Component) return (Component)o;
                return null;
            }
            set => _value =
                    value; //the linked blackboard variable is NEVER set through the TaskAgentParameter. Instead we set the local (inherited) variable
        }

        public override object GetValueBoxed() => value;

        public override void SetValueBoxed(object newValue)
        {
            value = newValue as Object;
        }

        ///<summary>Sets the hint type that the parameter is</summary>
        public void SetType(Type newType)
        {
            if (typeof(Object).IsAssignableFrom(newType)) _type = newType;
        }
    }
}
