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
using ParadoxNotion.Serialization.FullSerializer;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    //previous versions
    internal class SetField_0
    {
        [SerializeField]
        public string fieldName = null;

        [SerializeField]
        public Type targetType = null;
    }

    ///----------------------------------------------------------------------------------------------
    [Category("✫ Reflected"), Description("Set a variable on a script"), Name("Set Field", 5),
     fsMigrateVersions(typeof(SetField_0))]
    public class SetField : ActionTask, IReflectedWrapper, IMigratable<SetField_0>
    {
        ///----------------------------------------------------------------------------------------------
        [SerializeField]
        protected SerializedFieldInfo field;

        [SerializeField]
        protected BBObjectParameter setValue;

        private FieldInfo targetField => field;

        public override Type agentType {
            get {
                if (targetField == null) return typeof(Transform);
                return targetField.IsStatic ? null : targetField.RTReflectedOrDeclaredType();
            }
        }

        protected override string info {
            get {
                if (field == null) return "No Field Selected";
                if (targetField == null) return field.AsString().FormatError();
                var mInfo = targetField.IsStatic
                        ? targetField.RTReflectedOrDeclaredType().FriendlyName() : agentInfo;
                return string.Format("{0}.{1} = {2}", mInfo, targetField.Name, setValue);
            }
        }

        ///----------------------------------------------------------------------------------------------
        void IMigratable<SetField_0>.Migrate(SetField_0 model)
        {
            field = new SerializedFieldInfo(model.targetType?.RTGetField(model.fieldName));
        }

        ISerializedReflectedInfo IReflectedWrapper.GetSerializedInfo() => field;

        protected override string OnInit()
        {
            if (field == null) return "No Field Selected";
            if (targetField == null) return field.AsString().FormatError();
            return null;
        }

        protected override void OnExecute()
        {
            targetField.SetValue(targetField.IsStatic ? null : agent, setValue.value);
            EndAction();
        }

        private void SetTargetField(FieldInfo newField)
        {
            if (newField != null) {
                UndoUtility.RecordObject(ownerSystem.contextObject, "Set Reflection Member");
                field = new SerializedFieldInfo(newField);
                setValue.SetType(newField.FieldType);
            }
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            if (!Application.isPlaying && GUILayout.Button("Select Field")) {
                var menu = new GenericMenu();

                if (agent != null) {
                    foreach (var comp in agent.GetComponents(typeof(Component))
                            .Where(c => !c.hideFlags.HasFlag(HideFlags.HideInInspector)))
                        menu = EditorUtils.GetInstanceFieldSelectionMenu(comp.GetType(),
                            typeof(object), SetTargetField, menu);
                    menu.AddSeparator("/");
                }

                foreach (var t in TypePrefs.GetPreferedTypesList(typeof(object))) {
                    menu = EditorUtils.GetStaticFieldSelectionMenu(t, typeof(object),
                        SetTargetField, menu);
                    if (typeof(Component).IsAssignableFrom(t))
                        menu = EditorUtils.GetInstanceFieldSelectionMenu(t, typeof(object),
                            SetTargetField, menu);
                }
                menu.ShowAsBrowser("Select Field", GetType());
                Event.current.Use();
            }

            if (targetField != null) {
                GUILayout.BeginVertical("box");
                EditorGUILayout.LabelField("Type",
                    targetField.RTReflectedOrDeclaredType().FriendlyName());
                EditorGUILayout.LabelField("Field", targetField.Name);
                EditorGUILayout.LabelField("Field Type", targetField.FieldType.FriendlyName());
                EditorGUILayout.HelpBox(XMLDocs.GetMemberSummary(targetField), MessageType.None);
                GUILayout.EndVertical();
                BBParameterEditor.ParameterField("Set Value", setValue);
            }
        }
#endif
    }
}
