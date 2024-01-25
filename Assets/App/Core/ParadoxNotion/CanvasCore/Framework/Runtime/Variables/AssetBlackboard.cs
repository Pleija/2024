#region
using System;
using System.Collections.Generic;
using CSharpVitamins;
using Newtonsoft.Json;
using NodeCanvas.Framework.Internal;
using ParadoxNotion.Serialization;
using ParadoxNotion.Services;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using UnityEditor;
using UnityEngine;
using Object = UnityEngine.Object;
#endregion

namespace NodeCanvas.Framework
{
#if UNITY_EDITOR
#endif

    [CreateAssetMenu(menuName = "ParadoxNotion/CanvasCore/Blackboard Asset"),
     ShowOdinSerializedPropertiesInInspector]
    public class AssetBlackboard : ScriptableObject, ISerializationCallbackReceiver,
            IGlobalBlackboard
    {
        public event Action<Variable> onVariableAdded;
        public event Action<Variable> onVariableRemoved;
        public bool showFold;

        // [SerializeField]
        // public BlackBoardData Data;

        [SerializeField]
        private string _serializedBlackboard;


        [SerializeField]
        private string _version;

        public int LevelCount;

        [SerializeField]
        private List<Object> _objectReferences;

        [SerializeField]
        private string _UID = Guid.NewGuid().ToString();

        [ShowInInspector]
        public string tableName => "_" + ShortGuid.Encode(_UID).RegexReplace(@"\W+", "");

        [NonSerialized]
        private BlackboardSource _blackboard = new BlackboardSource();

        [NonSerialized]
        private List<BlackboardSource>  _levels = new List<BlackboardSource>();

        ///----------------------------------------------------------------------------------------------
        void ISerializationCallbackReceiver.OnBeforeSerialize()
        {
            if (this != null)
                UnitySerializationUtility.SerializeUnityObject(this, ref serializationData);
            SelfSerialize();
        }

        [SerializeField, HideInInspector]
        private SerializationData serializationData;

        void ISerializationCallbackReceiver.OnAfterDeserialize()
        {
            SelfDeserialize();
            if (this != null)
                UnitySerializationUtility.DeserializeUnityObject(this, ref serializationData);
        }

        ///----------------------------------------------------------------------------------------------
        private void SelfSerialize()
        {
            _objectReferences = new List<Object>();
            _serializedBlackboard = JSONSerializer.Serialize(typeof(BlackboardSource), _blackboard,
                _objectReferences);
        }

        private void SelfDeserialize()
        {
            _blackboard = JSONSerializer.Deserialize<BlackboardSource>(
                _serializedBlackboard, _objectReferences);
            if (_blackboard == null) _blackboard = new BlackboardSource();

        }

        ///----------------------------------------------------------------------------------------------
         Dictionary<string, Variable> IBlackboard.variables {
            get => _blackboard.variables;
            set => _blackboard.variables = value;
        }

        // [SerializeField]
        // private List<SortedDictionary<string, Variable>>
        //         values = new List<SortedDictionary<string, Variable>>();
        //
        // public List<SortedDictionary<string, Variable>> Values =>
        //         values ??= new List<SortedDictionary<string, Variable>>();

        Object IBlackboard.unityContextObject => this;
        IBlackboard IBlackboard.parent => null;
        Component IBlackboard.propertiesBindTarget => null;
        string IBlackboard.independantVariablesFieldName => null;

        void IBlackboard.TryInvokeOnVariableAdded(Variable variable)
        {
            if (onVariableAdded != null) onVariableAdded(variable);
        }

        void IBlackboard.TryInvokeOnVariableRemoved(Variable variable)
        {
            if (onVariableRemoved != null) onVariableRemoved(variable);
        }

        [field: NonSerialized]
        public string identifier { get; private set; }

        public string UID => _UID;

        [ContextMenu("Show Json"), Button]
        private void ShowJson()
        {
            //JSONSerializer.ShowData(JsonUtility.ToJson(_blackboard), name);
            JSONSerializer.ShowData(_serializedBlackboard, name);
        }

        public override string ToString() => identifier;

        private void OnValidate()
        {
            identifier = name;
        }

        ///----------------------------------------------------------------------------------------------
#if !UNITY_EDITOR
        void OnEnable()
        {
            this.InitializePropertiesBinding(null, false);
        }
#endif

        ///----------------------------------------------------------------------------------------------
#if UNITY_EDITOR
        private string tempJson;

        private List<Object> tempObjects;
        private bool bindingInit;

        //...
        private void OnEnable()
        {
            EditorApplication.playModeStateChanged -= PlayModeChange;
            EditorApplication.playModeStateChanged += PlayModeChange;

            if (Threader.applicationIsPlaying) {
                this.InitializePropertiesBinding(null, false);
                bindingInit = true;
            }
        }

        //...
        private void PlayModeChange(PlayModeStateChange state)
        {
            if (state == PlayModeStateChange.EnteredPlayMode) {
                tempJson = _serializedBlackboard;
                tempObjects = _objectReferences;
                if (!bindingInit) this.InitializePropertiesBinding(null, false);
            }

            if (state == PlayModeStateChange.ExitingPlayMode) {
                _serializedBlackboard = tempJson;
                _objectReferences = tempObjects;
                bindingInit = false;
                SelfDeserialize();
            }
        }

#endif
    }
}
