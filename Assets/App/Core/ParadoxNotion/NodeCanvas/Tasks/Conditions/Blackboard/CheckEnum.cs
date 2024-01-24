#region
using System;
using NodeCanvas.Framework;
using NodeCanvas.Framework.Internal;
using ParadoxNotion.Design;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("✫ Blackboard")]
    public class CheckEnum : ConditionTask
    {
        [BlackboardOnly]
        public BBObjectParameter valueA = new BBObjectParameter(typeof(Enum));

        public BBObjectParameter valueB = new BBObjectParameter(typeof(Enum));
        protected override string info => valueA + " == " + valueB;
        protected override bool OnCheck() => Equals(valueA.value, valueB.value);

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            DrawDefaultInspector();
            if (valueB.varType != valueA.refType) valueB.SetType(valueA.refType);
        }

#endif
    }
}
