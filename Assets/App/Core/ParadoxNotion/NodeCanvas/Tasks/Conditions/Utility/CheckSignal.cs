#region
using System.Collections.Generic;
using System.Linq;

#if UNITY_EDITOR
using NodeCanvas.Editor;
#endif
using NodeCanvas.Framework;
using NodeCanvas.Framework.Internal;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Utility"),
     Description(
         "Check for an invoked Signal with agent as the target. If Signal was invoked as global, then the target does not matter.")]
    public class CheckSignal : ConditionTask<Transform>
    {
        [SerializeField]
        private Dictionary<string, BBObjectParameter> argumentsMap =
                new Dictionary<string, BBObjectParameter>();

        public BBParameter<SignalDefinition> signalDefinition;
        protected override string info => signalDefinition.ToString();

        protected override string OnInit()
        {
            if (signalDefinition.isNoneOrNull) return "Missing Definition";
            return null;
        }

        protected override void OnEnable()
        {
            signalDefinition.value.onInvoke -= OnSignalInvoke;
            signalDefinition.value.onInvoke += OnSignalInvoke;
        }

        protected override void OnDisable()
        {
            signalDefinition.value.onInvoke -= OnSignalInvoke;
        }

        private void OnSignalInvoke(Transform sender, Transform receiver, bool isGlobal,
            params object[] args)
        {
            if (receiver == agent || isGlobal) {
                var def = signalDefinition.value;
                for (var i = 0; i < args.Length; i++)
                    argumentsMap[def.parameters[i].ID].value = args[i];
                YieldReturn(true);
            }
        }

        protected override bool OnCheck() => false;
        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            base.OnTaskInspectorGUI();
            if (signalDefinition.isNoneOrNull) return;
            var parameters = signalDefinition.value.parameters;
            EditorUtils.Separator();

            foreach (var parameter in parameters) {
                BBObjectParameter bbParam = null;
                if (!argumentsMap.TryGetValue(parameter.ID, out bbParam))
                    bbParam = argumentsMap[parameter.ID] = new BBObjectParameter(parameter.type)
                            { useBlackboard = true, bb = ownerSystemBlackboard };
                BBParameterEditor.ParameterField(parameter.name, bbParam, true);
            }
            foreach (var key in argumentsMap.Keys.ToArray())
                if (!parameters.Select(v => v.ID).Contains(key))
                    argumentsMap.Remove(key);
        }
#endif
        ///----------------------------------------------------------------------------------------------
    }
}
