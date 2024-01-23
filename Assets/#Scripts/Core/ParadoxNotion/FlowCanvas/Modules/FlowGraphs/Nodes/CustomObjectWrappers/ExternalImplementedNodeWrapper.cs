using UnityEngine;
using ParadoxNotion.Design;

namespace FlowCanvas.Nodes
{
    [DoNotList, Icon(runtimeIconTypeCallback: nameof(GetRuntimeIconType))]
    ///<summary>See IExternalImplementedNode</summary>
    public class ExternalImplementedNodeWrapper : FlowNode
    {
        [SerializeField]
        private Object _target;

        public IExternalImplementedNode target {
            get => _target as IExternalImplementedNode;
            set {
                if (!ReferenceEquals(_target, value)) {
                    _target = value as Object;
                    GatherPorts();
                }
            }
        }

        public override string name => _target != null ? _target.name : base.name;
        protected System.Type GetRuntimeIconType() => _target?.GetType();

        protected override void RegisterPorts()
        {
            if (_target != null) target.RegisterPorts(this);
        }

        public void SetTarget(IExternalImplementedNode target)
        {
            this.target = target;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnNodeInspectorGUI()
        {
            target = (IExternalImplementedNode)UnityEditor.EditorGUILayout.ObjectField("Target", target as Object
                , typeof(IExternalImplementedNode), true);
            base.OnNodeInspectorGUI();
        }
#endif
        ///----------------------------------------------------------------------------------------------
    }
}
