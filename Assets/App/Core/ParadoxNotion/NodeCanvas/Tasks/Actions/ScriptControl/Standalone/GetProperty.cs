#region
using System;
using System.Linq;
using System.Reflection;
#if UNITY_EDITOR
using NodeCanvas.Editor;
#endif
using NodeCanvas.Framework;
using NodeCanvas.Framework.Internal;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Name("Get Property (Desktop Only)", 8),
     Category("✫ Reflected/Faster Versions (Desktop Platforms Only)"),
     Description(
         "This version works in destop/JIT platform only.\n\nGet a property of a script and save it to the blackboard")]
    public class GetProperty : ActionTask, IReflectedWrapper
    {
        [SerializeField]
        protected ReflectedFunctionWrapper functionWrapper;

        private MethodInfo targetMethod =>
                functionWrapper != null ? functionWrapper.GetMethod() : null;

        public override Type agentType {
            get {
                if (targetMethod == null) return typeof(Transform);
                return targetMethod.IsStatic ? null : targetMethod.RTReflectedOrDeclaredType();
            }
        }

        protected override string info {
            get {
                if (functionWrapper == null) return "No Property Selected";
                if (targetMethod == null) return functionWrapper.AsString().FormatError();
                var mInfo = targetMethod.IsStatic
                        ? targetMethod.RTReflectedOrDeclaredType().FriendlyName() : agentInfo;
                return string.Format("{0} = {1}.{2}", functionWrapper.GetVariables()[0], mInfo,
                    targetMethod.Name);
            }
        }

        ISerializedReflectedInfo IReflectedWrapper.GetSerializedInfo() =>
                functionWrapper?.GetSerializedMethod();

        public override void OnValidate(ITaskSystem ownerSystem)
        {
            if (functionWrapper != null && functionWrapper.HasChanged())
                SetMethod(functionWrapper.GetMethod());
        }

        protected override string OnInit()
        {
            if (targetMethod == null) return "Missing Property";

            try {
                functionWrapper.Init(targetMethod.IsStatic ? null : agent);
                return null;
            }
            catch {
                return "Get Property Error";
            }
        }

        //do it by invoking method
        protected override void OnExecute()
        {
            if (functionWrapper == null) {
                EndAction(false);
                return;
            }
            functionWrapper.Call();
            EndAction();
        }

        private void SetMethod(MethodInfo method)
        {
            if (method != null) {
                UndoUtility.RecordObject(ownerSystem.contextObject, "Set Reflection Member");
                functionWrapper = ReflectedFunctionWrapper.Create(method, blackboard);
            }
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            if (!Application.isPlaying && GUILayout.Button("Select Property")) {
                var menu = new GenericMenu();

                if (agent != null) {
                    foreach (var comp in agent.GetComponents(typeof(Component))
                            .Where(c => !c.hideFlags.HasFlag(HideFlags.HideInInspector)))
                        menu = EditorUtils.GetInstanceMethodSelectionMenu(comp.GetType(),
                            typeof(object), typeof(object), SetMethod, 0, true,
                            true, menu);
                    menu.AddSeparator("/");
                }

                foreach (var t in TypePrefs.GetPreferedTypesList(typeof(object))) {
                    menu = EditorUtils.GetStaticMethodSelectionMenu(t, typeof(object),
                        typeof(object), SetMethod, 0, true, true, menu);
                    if (typeof(Component).IsAssignableFrom(t))
                        menu = EditorUtils.GetInstanceMethodSelectionMenu(t, typeof(object),
                            typeof(object), SetMethod, 0, true, true, menu);
                }
                menu.ShowAsBrowser("Select Property", GetType());
                Event.current.Use();
            }

            if (targetMethod != null) {
                GUILayout.BeginVertical("box");
                EditorGUILayout.LabelField("Type",
                    targetMethod.RTReflectedOrDeclaredType().FriendlyName());
                EditorGUILayout.LabelField("Property", targetMethod.Name);
                EditorGUILayout.LabelField("Property Type", targetMethod.ReturnType.FriendlyName());
                EditorGUILayout.HelpBox(XMLDocs.GetMemberSummary(targetMethod), MessageType.None);
                GUILayout.EndVertical();
                BBParameterEditor.ParameterField("Save As", functionWrapper.GetVariables()[0],
                    true);
            }
        }

#endif
    }
}
