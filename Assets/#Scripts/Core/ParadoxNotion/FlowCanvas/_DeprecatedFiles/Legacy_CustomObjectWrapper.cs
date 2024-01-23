using UnityEngine;
using ParadoxNotion.Design;

namespace FlowCanvas.Nodes
{
    [System.Obsolete("Use 'IReferencedObjectWrapper' along with 'ReferencedObjectTypeAttribute'")]
    public abstract class CustomObjectWrapper : FlowNode
    {
        public abstract void SetTarget(Object target);
    }

    [System.Obsolete("Use 'IReferencedObjectWrapper' along with 'ReferencedObjectTypeAttribute'")
     , Icon(runtimeIconTypeCallback: nameof(GetRuntimeIconType))]
    public abstract class CustomObjectWrapper<T> : CustomObjectWrapper where T : Object
    {
        [SerializeField]
        private T _target;

        public T target {
            get => _target;
            set {
                if (_target != value) {
                    _target = value;
                    GatherPorts();
                }
            }
        }

        public override string name => target != null ? target.name : base.name;

        public override void SetTarget(Object target)
        {
            if (target is T) this.target = (T)target;
        }

        protected System.Type GetRuntimeIconType() => target != null ? target.GetType() : null;
#if UNITY_EDITOR
        protected override void OnNodeInspectorGUI()
        {
            target = (T)UnityEditor.EditorGUILayout.ObjectField("Target", target, typeof(T), true);
            base.OnNodeInspectorGUI();
        }
#endif
    }
}
