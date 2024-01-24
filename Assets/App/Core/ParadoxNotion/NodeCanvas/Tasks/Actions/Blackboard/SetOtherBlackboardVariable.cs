#region
using NodeCanvas.Framework;
using NodeCanvas.Framework.Internal;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Blackboard"),
     Description("Use this to set a variable on any blackboard by overriding the agent")]
    public class SetOtherBlackboardVariable : ActionTask<Blackboard>
    {
        public BBObjectParameter newValue;

        [RequiredField]
        public BBParameter<string> targetVariableName;

        protected override string info => string.Format("<b>{0}</b> = {1}", targetVariableName,
            newValue != null ? newValue.ToString() : "");

        protected override void OnExecute()
        {
            agent.SetVariableValue(targetVariableName.value, newValue.value);
            EndAction();
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            if (GUILayout.Button("Select Target Variable Type"))
                EditorUtils.ShowPreferedTypesSelectionMenu(typeof(object), t => {
                    newValue.SetType(t);
                });
            if (newValue.varType != typeof(object)) DrawDefaultInspector();
        }

#endif
    }
}
