#region
using System;
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Serialization;
using UnityEditor;
using UnityEngine;
using Logger = ParadoxNotion.Services.Logger;
using Object = UnityEngine.Object;
#endregion

namespace NodeCanvas
{
    [AddComponentMenu("NodeCanvas/Standalone Action List (Bonus)")]
    public class ActionListPlayer : MonoBehaviour, ITaskSystem, ISerializationCallbackReceiver
    {
        public bool playOnAwake;

        [SerializeField]
        private string _serializedList;

        [SerializeField]
        private List<Object> _objectReferences;

        [SerializeField]
        private Blackboard _blackboard;

        private float timeStarted;

        ///----------------------------------------------------------------------------------------------
        [field: NonSerialized]
        public ActionList actionList { get; private set; }

        protected void Awake()
        {
            UpdateTasksOwner();
            if (playOnAwake) Play();
        }

        void ISerializationCallbackReceiver.OnBeforeSerialize()
        {
            // if ( ParadoxNotion.Services.Threader.applicationIsPlaying ) { return; }
            _objectReferences = new List<Object>();
            _serializedList = JSONSerializer.Serialize(
                typeof(ActionList), actionList, _objectReferences);
        }

        void ISerializationCallbackReceiver.OnAfterDeserialize()
        {
            actionList = JSONSerializer.Deserialize<ActionList>(_serializedList, _objectReferences);
            if (actionList == null) actionList = (ActionList)Task.Create(typeof(ActionList), this);
        }

        public float elapsedTime => Time.time - timeStarted;
        public float deltaTime => Time.deltaTime;
        Object ITaskSystem.contextObject => this;
        Component ITaskSystem.agent => this;

        public IBlackboard blackboard {
            get => _blackboard;
            set {
                if (!ReferenceEquals(_blackboard, value)) {
                    _blackboard = (Blackboard)value;
                    UpdateTasksOwner();
                }
            }
        }

        public void UpdateTasksOwner()
        {
            actionList.SetOwnerSystem(this);

            foreach (var a in actionList.actions) {
                a.SetOwnerSystem(this);
                BBParameter.SetBBFields(a, blackboard);
            }
        }

        void ITaskSystem.SendEvent(string name, object value, object sender)
        {
            Logger.LogWarning("Sending events to standalone action lists has no effect",
                LogTag.EXECUTION, this);
        }

        void ITaskSystem.SendEvent<T>(string name, T value, object sender)
        {
            Logger.LogWarning("Sending events to standalone action lists has no effect",
                LogTag.EXECUTION, this);
        }

        ///----------------------------------------------------------------------------------------------
        public static ActionListPlayer Create() =>
                new GameObject("ActionList").AddComponent<ActionListPlayer>();

        [ContextMenu("Play")]
        public void Play()
        {
            Play(this, blackboard, null);
        }

        public void Play(Action<Status> OnFinish)
        {
            Play(this, blackboard, OnFinish);
        }

        public void Play(Component agent, IBlackboard blackboard, Action<Status> OnFinish)
        {
            if (Application.isPlaying) {
                timeStarted = Time.time;
                actionList.ExecuteIndependent(agent, blackboard, OnFinish);
            }
        }

        public Status Execute() => actionList.Execute(this, blackboard);
        public Status Execute(Component agent) => actionList.Execute(agent, blackboard);

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        [MenuItem("Tools/ParadoxNotion/NodeCanvas/Create/Standalone Action List", false, 3)]
        private static void CreateActionListPlayer()
        {
            Selection.activeObject = Create();
        }

        private void Reset()
        {
            var bb = GetComponent<Blackboard>();
            _blackboard = bb != null ? bb : gameObject.AddComponent<Blackboard>();
            actionList = (ActionList)Task.Create(typeof(ActionList), this);
        }

        private void OnValidate()
        {
            if (!Application.isPlaying && !EditorApplication.isPlayingOrWillChangePlaymode)
                UpdateTasksOwner();
        }
#endif
    }
}
