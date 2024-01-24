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
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    ///----------------------------------------------------------------------------------------------
    //previous versions
    internal class CheckCSharpEvent_0
    {
        [SerializeField]
        public string eventName = null;

        [SerializeField]
        public Type targetType = null;
    }

    internal class CheckCSharpEvent_0<T>
    {
        [SerializeField]
        public string eventName = null;

        [SerializeField]
        public Type targetType = null;
    }

    internal class CheckCSharpEventValue_0<T>
    {
        [SerializeField]
        public string eventName = null;

        [SerializeField]
        public Type targetType = null;
    }

    [fsMigrateTo(typeof(CheckCSharpEvent))]
    internal class CheckStaticCSharpEvent
    {
        [SerializeField]
        public string eventName = null;

        [SerializeField]
        public Type targetType = null;
    }

    [fsMigrateTo(typeof(CheckCSharpEvent<>))]
    internal class CheckStaticCSharpEvent<T>
    {
        [SerializeField]
        public string eventName = null;

        [SerializeField]
        public Type targetType = null;
    }

    //previous versions
    ///----------------------------------------------------------------------------------------------
    [Category("✫ Reflected/Events"),
     Description(
         "Will subscribe to a public event of Action type and return true when the event is raised.\n(eg public event System.Action [name])"),
     fsMigrateVersions(typeof(CheckCSharpEvent_0))]
    public class CheckCSharpEvent : ConditionTask, IReflectedWrapper,
            IMigratable<CheckCSharpEvent_0>, IMigratable<CheckStaticCSharpEvent>
    {
        ///----------------------------------------------------------------------------------------------
        [SerializeField]
        private SerializedEventInfo eventInfo;

        private Delegate handler;
        private EventInfo targetEvent => eventInfo;

        public override Type agentType {
            get {
                if (targetEvent == null) return typeof(Transform);
                return targetEvent.IsStatic() ? null : targetEvent.RTReflectedOrDeclaredType();
            }
        }

        protected override string info {
            get {
                if (eventInfo == null) return "No Event Selected";
                if (targetEvent == null) return eventInfo.AsString().FormatError();
                return string.Format("'{0}' Raised", targetEvent.Name);
            }
        }

        ///----------------------------------------------------------------------------------------------
        void IMigratable<CheckCSharpEvent_0>.Migrate(CheckCSharpEvent_0 model)
        {
            var info = model.targetType?.RTGetEvent(model.eventName);
            if (info != null) eventInfo = new SerializedEventInfo(info);
        }

        void IMigratable<CheckStaticCSharpEvent>.Migrate(CheckStaticCSharpEvent model)
        {
            var info = model.targetType?.RTGetEvent(model.eventName);
            if (info != null) eventInfo = new SerializedEventInfo(info);
        }

        ISerializedReflectedInfo IReflectedWrapper.GetSerializedInfo() => eventInfo;

        protected override string OnInit()
        {
            if (eventInfo == null) return "No Event Selected";
            if (targetEvent == null) return eventInfo.AsString().FormatError();
            var methodInfo = GetType().RTGetMethod("Raised");
            handler = methodInfo.RTCreateDelegate(targetEvent.EventHandlerType, this);
            return null;
        }

        protected override void OnEnable()
        {
            if (handler != null)
                targetEvent.AddEventHandler(targetEvent.IsStatic() ? null : agent, handler);
        }

        protected override void OnDisable()
        {
            if (handler != null)
                targetEvent.RemoveEventHandler(targetEvent.IsStatic() ? null : agent, handler);
        }

        public void Raised()
        {
            YieldReturn(true);
        }

        protected override bool OnCheck() => false;

        private void SetTargetEvent(EventInfo info)
        {
            if (info != null) {
                UndoUtility.RecordObject(ownerSystem.contextObject, "Set Reflection Member");
                eventInfo = new SerializedEventInfo(info);
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
                            .Where(c => !c.hideFlags.HasFlag(HideFlags.HideInInspector)))
                        menu = EditorUtils.GetInstanceEventSelectionMenu(comp.GetType(), null,
                            SetTargetEvent, menu);
                    menu.AddSeparator("/");
                }

                foreach (var t in TypePrefs.GetPreferedTypesList(typeof(object))) {
                    menu = EditorUtils.GetStaticEventSelectionMenu(t, null, SetTargetEvent, menu);
                    if (typeof(Component).IsAssignableFrom(t))
                        menu = EditorUtils.GetInstanceEventSelectionMenu(t, null, SetTargetEvent,
                            menu);
                }
                menu.ShowAsBrowser("Select Event", GetType());
                Event.current.Use();
            }

            if (targetEvent != null) {
                GUILayout.BeginVertical("box");
                EditorGUILayout.LabelField("Selected Type",
                    targetEvent.DeclaringType.FriendlyName());
                EditorGUILayout.LabelField("Selected Event", targetEvent.Name);
                GUILayout.EndVertical();
            }
        }
#endif
    }

    ///----------------------------------------------------------------------------------------------
    [Category("✫ Reflected/Events"),
     Description(
         "Will subscribe to a public event of Action<T> type and return true when the event is raised.\n(eg public event System.Action<T> [name])"),
     fsMigrateVersions(typeof(CheckCSharpEvent_0<>))]
    public class CheckCSharpEvent<T> : ConditionTask, IReflectedWrapper,
            IMigratable<CheckCSharpEvent_0<T>>, IMigratable<CheckStaticCSharpEvent<T>>
    {
        ///----------------------------------------------------------------------------------------------
        [SerializeField]
        private SerializedEventInfo eventInfo;

        private Delegate handler;

        [SerializeField, BlackboardOnly]
        private BBParameter<T> saveAs = null;

        private EventInfo targetEvent => eventInfo;

        public override Type agentType {
            get {
                if (targetEvent == null) return typeof(Transform);
                return targetEvent.IsStatic() ? null : targetEvent.RTReflectedOrDeclaredType();
            }
        }

        protected override string info {
            get {
                if (eventInfo == null) return "No Event Selected";
                if (targetEvent == null) return eventInfo.AsString().FormatError();
                return string.Format("'{0}' Raised", targetEvent.Name);
            }
        }

        ///----------------------------------------------------------------------------------------------
        void IMigratable<CheckCSharpEvent_0<T>>.Migrate(CheckCSharpEvent_0<T> model)
        {
            SetTargetEvent(model.targetType?.RTGetEvent(model.eventName));
        }

        void IMigratable<CheckStaticCSharpEvent<T>>.Migrate(CheckStaticCSharpEvent<T> model)
        {
            SetTargetEvent(model.targetType?.RTGetEvent(model.eventName));
        }

        ISerializedReflectedInfo IReflectedWrapper.GetSerializedInfo() => eventInfo;

        protected override string OnInit()
        {
            if (eventInfo == null) return "No Event Selected";
            if (targetEvent == null) return eventInfo.AsString().FormatError();
            var methodInfo = GetType().RTGetMethod("Raised");
            handler = methodInfo.RTCreateDelegate(targetEvent.EventHandlerType, this);
            return null;
        }

        protected override void OnEnable()
        {
            if (handler != null)
                targetEvent.AddEventHandler(targetEvent.IsStatic() ? null : agent, handler);
        }

        protected override void OnDisable()
        {
            if (handler != null)
                targetEvent.RemoveEventHandler(targetEvent.IsStatic() ? null : agent, handler);
        }

        public void Raised(T eventValue)
        {
            saveAs.value = eventValue;
            YieldReturn(true);
        }

        protected override bool OnCheck() => false;

        private void SetTargetEvent(EventInfo info)
        {
            if (info != null) eventInfo = new SerializedEventInfo(info);
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
                            .Where(c => c.hideFlags == 0))
                        menu = EditorUtils.GetInstanceEventSelectionMenu(comp.GetType(), typeof(T),
                            SetTargetEvent, menu);
                    menu.AddSeparator("/");
                }

                foreach (var t in TypePrefs.GetPreferedTypesList(typeof(object))) {
                    menu = EditorUtils.GetStaticEventSelectionMenu(t, typeof(T), SetTargetEvent,
                        menu);
                    if (typeof(Component).IsAssignableFrom(t))
                        menu = EditorUtils.GetInstanceEventSelectionMenu(t, typeof(T),
                            SetTargetEvent, menu);
                }
                menu.ShowAsBrowser("Select Event", GetType());
                Event.current.Use();
            }

            if (targetEvent != null) {
                GUILayout.BeginVertical("box");
                EditorGUILayout.LabelField("Selected Type",
                    targetEvent.DeclaringType.FriendlyName());
                EditorGUILayout.LabelField("Selected Event", targetEvent.Name);
                GUILayout.EndVertical();
                BBParameterEditor.ParameterField("Save Value As", saveAs, true);
            }
        }
#endif
    }

    ///----------------------------------------------------------------------------------------------
    [Category("✫ Reflected/Events"),
     Description(
         "Will subscribe to a public event of Action<T> type and return true when the event is raised and it's value is equal to provided value as well.\n(eg public event System.Action<T> [name])"),
     fsMigrateVersions(typeof(CheckCSharpEventValue_0<>))]
    public class CheckCSharpEventValue<T> : ConditionTask, IReflectedWrapper,
            IMigratable<CheckCSharpEventValue_0<T>>
    {
        [SerializeField]
        private BBParameter<T> checkValue = null;

        ///----------------------------------------------------------------------------------------------
        [SerializeField]
        private SerializedEventInfo eventInfo;

        private Delegate handler;
        private EventInfo targetEvent => eventInfo;

        public override Type agentType {
            get {
                if (targetEvent == null) return typeof(Transform);
                return targetEvent.IsStatic() ? null : targetEvent.RTReflectedOrDeclaredType();
            }
        }

        protected override string info {
            get {
                if (eventInfo == null) return "No Event Selected";
                if (targetEvent == null) return eventInfo.AsString().FormatError();
                return string.Format("'{0}' Raised && Value == {1}", targetEvent.Name, checkValue);
            }
        }

        ///----------------------------------------------------------------------------------------------
        void IMigratable<CheckCSharpEventValue_0<T>>.Migrate(CheckCSharpEventValue_0<T> model)
        {
            SetTargetEvent(model.targetType?.RTGetEvent(model.eventName));
        }

        ISerializedReflectedInfo IReflectedWrapper.GetSerializedInfo() => eventInfo;

        protected override string OnInit()
        {
            if (eventInfo == null) return "No Event Selected";
            if (targetEvent == null) return eventInfo.AsString().FormatError();
            var methodInfo = GetType().RTGetMethod("Raised");
            handler = methodInfo.RTCreateDelegate(targetEvent.EventHandlerType, this);
            return null;
        }

        protected override void OnEnable()
        {
            if (handler != null)
                targetEvent.AddEventHandler(targetEvent.IsStatic() ? null : agent, handler);
        }

        protected override void OnDisable()
        {
            if (handler != null)
                targetEvent.RemoveEventHandler(targetEvent.IsStatic() ? null : agent, handler);
        }

        public void Raised(T eventValue)
        {
            if (ObjectUtils.AnyEquals(checkValue.value, eventValue)) YieldReturn(true);
        }

        protected override bool OnCheck() => false;

        private void SetTargetEvent(EventInfo info)
        {
            if (info != null) eventInfo = new SerializedEventInfo(info);
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
                            .Where(c => c.hideFlags == 0))
                        menu = EditorUtils.GetInstanceEventSelectionMenu(comp.GetType(), typeof(T),
                            SetTargetEvent, menu);
                    menu.AddSeparator("/");
                }

                foreach (var t in TypePrefs.GetPreferedTypesList(typeof(object))) {
                    menu = EditorUtils.GetStaticEventSelectionMenu(t, typeof(T), SetTargetEvent,
                        menu);
                    if (typeof(Component).IsAssignableFrom(t))
                        menu = EditorUtils.GetInstanceEventSelectionMenu(t, typeof(T),
                            SetTargetEvent, menu);
                }
                menu.ShowAsBrowser("Select Event", GetType());
                Event.current.Use();
            }

            if (targetEvent != null) {
                GUILayout.BeginVertical("box");
                EditorGUILayout.LabelField("Selected Type",
                    targetEvent.DeclaringType.FriendlyName());
                EditorGUILayout.LabelField("Selected Event", targetEvent.Name);
                GUILayout.EndVertical();
                BBParameterEditor.ParameterField("Check Value", checkValue);
            }
        }
#endif
    }
}
