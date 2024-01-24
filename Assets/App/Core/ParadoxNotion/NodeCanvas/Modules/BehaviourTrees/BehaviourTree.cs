#region
using System;
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.BehaviourTrees
{
    ///<summary> BehaviourTrees are used to create advanced AI and logic based on simple rules.</summary>
    [GraphInfo(packageName = "NodeCanvas",
         docsURL = "https://nodecanvas.paradoxnotion.com/documentation/",
         resourcesURL = "https://nodecanvas.paradoxnotion.com/downloads/",
         forumsURL = "https://nodecanvas.paradoxnotion.com/forums-page/"),
     CreateAssetMenu(menuName = "ParadoxNotion/NodeCanvas/Behaviour Tree Asset")]
    public class BehaviourTree : Graph
    {
        private Status _rootStatus = Status.Resting;
        private float intervalCounter;

        ///----------------------------------------------------------------------------------------------
        ///<summary>Should the tree repeat forever?</summary>
        [NonSerialized]
        public bool repeat = true;

        ///<summary>The frequency in seconds for the tree to repeat if set to repeat.</summary>
        [NonSerialized]
        public float updateInterval;

        ///<summary>The last status of the root node</summary>
        public Status rootStatus {
            get => _rootStatus;
            private set {
                if (_rootStatus != value) {
                    _rootStatus = value;
                    if (onRootStatusChanged != null) onRootStatusChanged(this, value);
                }
            }
        }

        ///----------------------------------------------------------------------------------------------
        public override Type baseNodeType => typeof(BTNode);

        public override bool requiresAgent => true;
        public override bool requiresPrimeNode => true;
        public override bool isTree => true;
        public override bool allowBlackboardOverrides => true;
        public sealed override bool canAcceptVariableDrops => false;
        public override PlanarDirection flowDirection => PlanarDirection.Vertical;

        public override object OnDerivedDataSerialization()
        {
            var data = new DerivedSerializationData();
            data.repeat = repeat;
            data.updateInterval = updateInterval;
            return data;
        }

        public override void OnDerivedDataDeserialization(object data)
        {
            if (data is DerivedSerializationData) {
                repeat = ((DerivedSerializationData)data).repeat;
                updateInterval = ((DerivedSerializationData)data).updateInterval;
            }
        }

        ///<summary>Raised when the root status of the behaviour is changed</summary>
        public static event Action<BehaviourTree, Status> onRootStatusChanged;

        ///----------------------------------------------------------------------------------------------
        protected override void OnGraphStarted()
        {
            intervalCounter = updateInterval;
            rootStatus = primeNode.status;
        }

        protected override void OnGraphUpdate()
        {
            if (intervalCounter >= updateInterval) {
                intervalCounter = 0;
                if (Tick(agent, blackboard) != Status.Running && !repeat)
                    Stop(rootStatus == Status.Success);
            }
            if (updateInterval > 0) intervalCounter += Time.deltaTime;
        }

        ///<summary>Tick the tree once for the provided agent and with the provided blackboard</summary>
        private Status Tick(Component agent, IBlackboard blackboard)
        {
            if (rootStatus != Status.Running) primeNode.Reset();
            return rootStatus = primeNode.Execute(agent, blackboard);
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        [MenuItem("Tools/ParadoxNotion/NodeCanvas/Create/Behaviour Tree Asset", false, 0)]
        private static void Editor_CreateGraph()
        {
            var newGraph = EditorUtils.CreateAsset<BehaviourTree>();
            Selection.activeObject = newGraph;
        }
#endif
        ///----------------------------------------------------------------------------------------------
        [Serializable]
        private class DerivedSerializationData
        {
            public bool repeat;
            public float updateInterval;
        }
    }
}
