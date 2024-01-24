#region
using System;
using System.Linq;
using System.Reflection;
using NodeCanvas.Editor;
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization;
using ParadoxNotion.Serialization.FullSerializer;
using UnityEditor;
using UnityEngine;
using UnityEngine.Events;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    ///----------------------------------------------------------------------------------------------
    //previous versions
    internal class CheckUnityEvent_0
    {
        [SerializeField]
        public string eventName = null;

        [SerializeField]
        public Type targetType = null;
    }

    internal class CheckUnityEvent_0<T>
    {
        [SerializeField]
        public string eventName = null;

        [SerializeField]
        public Type targetType = null;
    }

    internal class CheckUnityEventValue_0<T>
    {
        [SerializeField]
        public string eventName = null;

        [SerializeField]
        public Type targetType = null;
    }

    ///----------------------------------------------------------------------------------------------
    [Category("✫ Reflected/Events"),
     Description(
         "Will subscribe to a public UnityEvent and return true when that event is raised."),
     fsMigrateVersions(typeof(CheckUnityEvent_0))]
    public class CheckUnityEvent : ConditionTask, IReflectedWrapper, IMigratable<CheckUnityEvent_0>
    {
        ///----------------------------------------------------------------------------------------------
        [SerializeField]
        private SerializedUnityEventInfo _eventInfo;

        private UnityEvent unityEvent;
        private MemberInfo targetMember => _eventInfo != null ? _eventInfo.AsMemberInfo() : null;
        private bool isStatic => _eventInfo != null ? _eventInfo.isStatic : false;
        private Type eventType => _eventInfo != null ? _eventInfo.memberType : null;
        private FieldInfo targetEventField => _eventInfo;
        private PropertyInfo targetEventProp => _eventInfo;

        public override Type agentType {
            get {
                if (targetMember == null) return typeof(Transform);
                return isStatic ? null : targetMember.RTReflectedOrDeclaredType();
            }
        }

        protected override string info {
            get {
                if (_eventInfo == null) return "No Event Selected";
                if (targetMember == null) return _eventInfo.AsString().FormatError();
                return string.Format("'{0}' Raised", targetMember.Name);
            }
        }

        ///----------------------------------------------------------------------------------------------
        void IMigratable<CheckUnityEvent_0>.Migrate(CheckUnityEvent_0 model)
        {
            _eventInfo =
                    new SerializedUnityEventInfo(model.targetType?.RTGetField(model.eventName));
        }

        ISerializedReflectedInfo IReflectedWrapper.GetSerializedInfo() => _eventInfo;

        protected override string OnInit()
        {
            if (_eventInfo == null) return "No Event Selected";
            if (targetMember == null) return _eventInfo.AsString();
            if (targetEventField != null) unityEvent = (UnityEvent)targetEventField.GetValue(agent);
            if (targetEventProp != null) unityEvent = (UnityEvent)targetEventProp.GetValue(agent);
            return null;
        }

        protected override void OnEnable()
        {
            if (unityEvent != null) unityEvent.AddListener(Raised);
        }

        protected override void OnDisable()
        {
            if (unityEvent != null) unityEvent.RemoveListener(Raised);
        }

        public void Raised()
        {
            YieldReturn(true);
        }

        protected override bool OnCheck() => false;

        private void SetTargetEvent(MemberInfo newMember)
        {
            if (newMember != null) {
                UndoUtility.RecordObject(ownerSystem.contextObject, "Set Reflection Member");
                _eventInfo = new SerializedUnityEventInfo(newMember);
            }
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            if (!Application.isPlaying && GUILayout.Button("Select Event")) {
                var menu = new GenericMenu();

                if (agent != null) {
                    foreach (var comp in agent.GetComponents(typeof(Component))
                            .Where(c => !c.hideFlags.HasFlag(HideFlags.HideInInspector))) {
                        menu = EditorUtils.GetInstanceFieldSelectionMenu(comp.GetType(),
                            typeof(UnityEvent), SetTargetEvent, menu);
                        menu = EditorUtils.GetInstancePropertySelectionMenu(comp.GetType(),
                            typeof(UnityEvent), SetTargetEvent, true, false, menu);
                    }
                    menu.AddSeparator("/");
                }

                foreach (var t in TypePrefs.GetPreferedTypesList(typeof(object))) {
                    menu = EditorUtils.GetStaticFieldSelectionMenu(t, typeof(UnityEvent),
                        SetTargetEvent, menu);
                    menu = EditorUtils.GetStaticPropertySelectionMenu(t, typeof(UnityEvent),
                        SetTargetEvent, true, false, menu);

                    if (typeof(Component).IsAssignableFrom(t)) {
                        menu = EditorUtils.GetInstanceFieldSelectionMenu(t, typeof(UnityEvent),
                            SetTargetEvent, menu);
                        menu = EditorUtils.GetInstancePropertySelectionMenu(t, typeof(UnityEvent),
                            SetTargetEvent, true, false, menu);
                    }
                }
                menu.ShowAsBrowser("Select Event", GetType());
                Event.current.Use();
            }

            if (targetMember != null) {
                GUILayout.BeginVertical("box");
                EditorGUILayout.LabelField("Type",
                    targetMember.RTReflectedOrDeclaredType().FriendlyName());
                EditorGUILayout.LabelField("Event", targetMember.Name);
                EditorGUILayout.LabelField("Event Type", eventType.FriendlyName());
                GUILayout.EndVertical();
            }
        }
#endif
    }

    ///----------------------------------------------------------------------------------------------
    [Category("✫ Reflected/Events"),
     Description(
         "Will subscribe to a public UnityEvent<T> and return true when that event is raised."),
     fsMigrateVersions(typeof(CheckUnityEvent_0<>))]
    public class CheckUnityEvent<T> : ConditionTask, IReflectedWrapper,
            IMigratable<CheckUnityEvent_0<T>>
    {
        ///----------------------------------------------------------------------------------------------
        [SerializeField]
        private SerializedUnityEventInfo _eventInfo;

        [SerializeField, BlackboardOnly]
        private BBParameter<T> saveAs = null;

        private UnityEvent<T> unityEvent;
        private MemberInfo targetMember => _eventInfo != null ? _eventInfo.AsMemberInfo() : null;
        private bool isStatic => _eventInfo != null ? _eventInfo.isStatic : false;
        private Type eventType => _eventInfo != null ? _eventInfo.memberType : null;
        private FieldInfo targetEventField => _eventInfo;
        private PropertyInfo targetEventProp => _eventInfo;

        public override Type agentType {
            get {
                if (targetMember == null) return typeof(Transform);
                return isStatic ? null : targetMember.RTReflectedOrDeclaredType();
            }
        }

        protected override string info {
            get {
                if (_eventInfo == null) return "No Event Selected";
                if (targetMember == null) return _eventInfo.AsString().FormatError();
                return string.Format("'{0}' Raised", targetMember.Name);
            }
        }

        ///----------------------------------------------------------------------------------------------
        void IMigratable<CheckUnityEvent_0<T>>.Migrate(CheckUnityEvent_0<T> model)
        {
            _eventInfo =
                    new SerializedUnityEventInfo(model.targetType?.RTGetField(model.eventName));
        }

        ISerializedReflectedInfo IReflectedWrapper.GetSerializedInfo() => _eventInfo;

        protected override string OnInit()
        {
            if (_eventInfo == null) return "No Event Selected";
            if (targetMember == null) return _eventInfo.AsString();
            if (targetEventField != null)
                unityEvent = (UnityEvent<T>)targetEventField.GetValue(agent);
            if (targetEventProp != null)
                unityEvent = (UnityEvent<T>)targetEventProp.GetValue(agent);
            return null;
        }

        protected override void OnEnable()
        {
            if (unityEvent != null) unityEvent.AddListener(Raised);
        }

        protected override void OnDisable()
        {
            if (unityEvent != null) unityEvent.RemoveListener(Raised);
        }

        public void Raised(T eventValue)
        {
            saveAs.value = eventValue;
            YieldReturn(true);
        }

        protected override bool OnCheck() => false;

        private void SetTargetEvent(MemberInfo newMember)
        {
            if (newMember != null) _eventInfo = new SerializedUnityEventInfo(newMember);
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            if (!Application.isPlaying && GUILayout.Button("Select Event")) {
                var menu = new GenericMenu();

                if (agent != null) {
                    foreach (var comp in agent.GetComponents(typeof(Component))
                            .Where(c => c.hideFlags == 0)) {
                        menu = EditorUtils.GetInstanceFieldSelectionMenu(comp.GetType(),
                            typeof(UnityEvent<T>), SetTargetEvent, menu);
                        menu = EditorUtils.GetInstancePropertySelectionMenu(comp.GetType(),
                            typeof(UnityEvent<T>), SetTargetEvent, true, false, menu);
                    }
                    menu.AddSeparator("/");
                }

                foreach (var t in TypePrefs.GetPreferedTypesList(typeof(object))) {
                    menu = EditorUtils.GetStaticFieldSelectionMenu(t, typeof(UnityEvent<T>),
                        SetTargetEvent, menu);
                    menu = EditorUtils.GetStaticPropertySelectionMenu(t, typeof(UnityEvent<T>),
                        SetTargetEvent, true, false, menu);

                    if (typeof(Component).IsAssignableFrom(t)) {
                        menu = EditorUtils.GetInstanceFieldSelectionMenu(t, typeof(UnityEvent<T>),
                            SetTargetEvent, menu);
                        menu = EditorUtils.GetInstancePropertySelectionMenu(t,
                            typeof(UnityEvent<T>), SetTargetEvent, true, false, menu);
                    }
                }
                menu.ShowAsBrowser("Select Event", GetType());
                Event.current.Use();
            }

            if (targetMember != null) {
                GUILayout.BeginVertical("box");
                EditorGUILayout.LabelField("Type",
                    targetMember.RTReflectedOrDeclaredType().FriendlyName());
                EditorGUILayout.LabelField("Event", targetMember.Name);
                EditorGUILayout.LabelField("Event Type", eventType.FriendlyName());
                GUILayout.EndVertical();
                BBParameterEditor.ParameterField("Save Value As", saveAs, true);
            }
        }
#endif
    }

    ///----------------------------------------------------------------------------------------------
    [Category("✫ Reflected/Events"),
     Description(
         "Will subscribe to a public UnityEvent<T> and return true when that event is raised and it's value is equal to provided value as well."),
     fsMigrateVersions(typeof(CheckUnityEventValue_0<>))]
    public class CheckUnityEventValue<T> : ConditionTask, IReflectedWrapper,
            IMigratable<CheckUnityEventValue_0<T>>
    {
        ///----------------------------------------------------------------------------------------------
        [SerializeField]
        private SerializedUnityEventInfo _eventInfo;

        [SerializeField]
        private BBParameter<T> checkValue = null;

        private UnityEvent<T> unityEvent;
        private MemberInfo targetMember => _eventInfo != null ? _eventInfo.AsMemberInfo() : null;
        private bool isStatic => _eventInfo != null ? _eventInfo.isStatic : false;
        private Type eventType => _eventInfo != null ? _eventInfo.memberType : null;
        private FieldInfo targetEventField => _eventInfo;
        private PropertyInfo targetEventProp => _eventInfo;

        public override Type agentType {
            get {
                if (targetMember == null) return typeof(Transform);
                return isStatic ? null : targetMember.RTReflectedOrDeclaredType();
            }
        }

        protected override string info {
            get {
                if (_eventInfo == null) return "No Event Selected";
                if (targetMember == null) return _eventInfo.AsString().FormatError();
                return string.Format("'{0}' Raised && Value == {1}", targetMember.Name, checkValue);
            }
        }

        ///----------------------------------------------------------------------------------------------
        void IMigratable<CheckUnityEventValue_0<T>>.Migrate(CheckUnityEventValue_0<T> model)
        {
            _eventInfo =
                    new SerializedUnityEventInfo(model.targetType?.RTGetField(model.eventName));
        }

        ISerializedReflectedInfo IReflectedWrapper.GetSerializedInfo() => _eventInfo;

        protected override string OnInit()
        {
            if (_eventInfo == null) return "No Event Selected";
            if (targetEventField == null) return _eventInfo.AsString();
            if (targetEventField != null)
                unityEvent = (UnityEvent<T>)targetEventField.GetValue(agent);
            if (targetEventProp != null)
                unityEvent = (UnityEvent<T>)targetEventProp.GetValue(agent);
            return null;
        }

        protected override void OnEnable()
        {
            if (unityEvent != null) unityEvent.AddListener(Raised);
        }

        protected override void OnDisable()
        {
            if (unityEvent != null) unityEvent.RemoveListener(Raised);
        }

        public void Raised(T eventValue)
        {
            if (ObjectUtils.AnyEquals(checkValue.value, eventValue)) YieldReturn(true);
        }

        protected override bool OnCheck() => false;

        private void SetTargetEvent(MemberInfo newMember)
        {
            if (newMember != null) _eventInfo = new SerializedUnityEventInfo(newMember);
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            if (!Application.isPlaying && GUILayout.Button("Select Event")) {
                var menu = new GenericMenu();

                if (agent != null) {
                    foreach (var comp in agent.GetComponents(typeof(Component))
                            .Where(c => c.hideFlags == 0)) {
                        menu = EditorUtils.GetInstanceFieldSelectionMenu(comp.GetType(),
                            typeof(UnityEvent<T>), SetTargetEvent, menu);
                        menu = EditorUtils.GetInstancePropertySelectionMenu(comp.GetType(),
                            typeof(UnityEvent<T>), SetTargetEvent, true, false, menu);
                    }
                    menu.AddSeparator("/");
                }

                foreach (var t in TypePrefs.GetPreferedTypesList(typeof(object))) {
                    menu = EditorUtils.GetStaticFieldSelectionMenu(t, typeof(UnityEvent<T>),
                        SetTargetEvent, menu);
                    menu = EditorUtils.GetStaticPropertySelectionMenu(t, typeof(UnityEvent<T>),
                        SetTargetEvent, true, false, menu);

                    if (typeof(Component).IsAssignableFrom(t)) {
                        menu = EditorUtils.GetInstanceFieldSelectionMenu(t, typeof(UnityEvent<T>),
                            SetTargetEvent, menu);
                        menu = EditorUtils.GetInstancePropertySelectionMenu(t,
                            typeof(UnityEvent<T>), SetTargetEvent, true, false, menu);
                    }
                }
                menu.ShowAsBrowser("Select Event", GetType());
                Event.current.Use();
            }

            if (targetMember != null) {
                GUILayout.BeginVertical("box");
                EditorGUILayout.LabelField("Type",
                    targetMember.RTReflectedOrDeclaredType().FriendlyName());
                EditorGUILayout.LabelField("Event", targetMember.Name);
                EditorGUILayout.LabelField("Event Type", eventType.FriendlyName());
                GUILayout.EndVertical();
                BBParameterEditor.ParameterField("Check Value", checkValue);
            }
        }
#endif
    }
}
