#region
using System;
using System.Linq;
using System.Reflection;
using NodeCanvas.Editor;
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
    [Name("Get Property", 8), Category("✫ Reflected"),
     Description("Get a property of a script and save it to the blackboard")]
    public class GetProperty_Multiplatform : ActionTask, IReflectedWrapper
    {
        [SerializeField]
        protected SerializedMethodInfo method;

        [SerializeField, BlackboardOnly]
        protected BBObjectParameter returnValue;

        private MethodInfo targetMethod => method;

        public override Type agentType {
            get {
                if (targetMethod == null) return typeof(Transform);
                return targetMethod.IsStatic ? null : targetMethod.RTReflectedOrDeclaredType();
            }
        }

        protected override string info {
            get {
                if (method == null) return "No Property Selected";
                if (targetMethod == null) return method.AsString().FormatError();
                var mInfo = targetMethod.IsStatic
                        ? targetMethod.RTReflectedOrDeclaredType().FriendlyName() : agentInfo;
                return string.Format("{0} = {1}.{2}", returnValue, mInfo, targetMethod.Name);
            }
        }

        ISerializedReflectedInfo IReflectedWrapper.GetSerializedInfo() => method;

        public override void OnValidate(ITaskSystem ownerSystem)
        {
            if (method != null && method.HasChanged()) SetMethod(method);
        }

        protected override string OnInit()
        {
            if (method == null) return "No Property selected";
            if (targetMethod == null)
                return string.Format("Missing Property '{0}'", method.AsString());
            return null;
        }

        protected override void OnExecute()
        {
            returnValue.value = targetMethod.Invoke(targetMethod.IsStatic ? null : agent, null);
            EndAction();
        }

        private void SetMethod(MethodInfo method)
        {
            if (method != null) {
                UndoUtility.RecordObject(ownerSystem.contextObject, "Set Reflection Member");
                this.method = new SerializedMethodInfo(method);
                returnValue.SetType(method.ReturnType);
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
                BBParameterEditor.ParameterField("Save As", returnValue, true);
            }
        }
#endif
    }
}
