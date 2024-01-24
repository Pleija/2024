#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Utility"),
     Description("Simply use to debug return true or false by inverting the condition if needed")]
    public class DebugCondition : ConditionTask
    {
        protected override bool OnCheck() => false;

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            if (Application.isPlaying && GUILayout.Button("Tick True")) YieldReturn(true);
        }

#endif
    }
}
