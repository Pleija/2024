using UnityEngine;
using System.Collections.Generic;
using CSharpVitamins;
using NodeCanvas.Framework.Internal;
using ParadoxNotion.Serialization;
using Sirenix.OdinInspector;
using Sirenix.OdinInspector.Editor;
using Sirenix.Serialization;
using UnityEditor;

namespace NodeCanvas.Framework
{
#if UNITY_EDITOR
    [CustomEditor(typeof(AssetBlackboard))]
    public class AssetBlackboardEditor : OdinEditor { }
#endif
    [CreateAssetMenu(menuName = "ParadoxNotion/CanvasCore/Blackboard Asset"),
     ShowOdinSerializedPropertiesInInspector]
    public class AssetBlackboard : ScriptableObject, ISerializationCallbackReceiver,
        IGlobalBlackboard
    {
        public event System.Action<Variable> onVariableAdded;
        public event System.Action<Variable> onVariableRemoved;
        public bool showFold = false;
        public BlackBoardData Data;

        [SerializeField]
        private string _serializedBlackboard;

        [SerializeField]
        private string _version;

        [SerializeField]
        private List<Object> _objectReferences;

        [SerializeField]
        private string _UID = System.Guid.NewGuid().ToString();

        [ShowInInspector]
        public string tableName => "_" + ShortGuid.Encode(_UID).RegexReplace(@"\W+", "");

        [System.NonSerialized]
        private string _identifier;

        [System.NonSerialized]
        private BlackboardSource _blackboard = new BlackboardSource();

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
            _blackboard =
                JSONSerializer.Deserialize<BlackboardSource>(_serializedBlackboard,
                    _objectReferences);
            if (_blackboard == null) _blackboard = new BlackboardSource();
        }

        ///----------------------------------------------------------------------------------------------
        Dictionary<string, Variable> IBlackboard.variables {
            get => _blackboard.variables;
            set => _blackboard.variables = value;
        }

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

        public string identifier => _identifier;
        public string UID => _UID;

        [ContextMenu("Show Json")]
        private void ShowJson()
        {
            JSONSerializer.ShowData(_serializedBlackboard, name);
        }

        public override string ToString() => identifier;

        private void OnValidate()
        {
            _identifier = name;
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

            if (ParadoxNotion.Services.Threader.applicationIsPlaying) {
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
