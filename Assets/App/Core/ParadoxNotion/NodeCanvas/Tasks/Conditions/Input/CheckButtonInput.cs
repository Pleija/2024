#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("Input (Legacy System)")]
    public class CheckButtonInput : ConditionTask
    {
        [RequiredField]
        public BBParameter<string> buttonName = "Fire1";

        public PressTypes pressType = PressTypes.Down;
        protected override string info => pressType + " " + buttonName;

        protected override bool OnCheck()
        {
            if (pressType == PressTypes.Down) return Input.GetButtonDown(buttonName.value);
            if (pressType == PressTypes.Up) return Input.GetButtonUp(buttonName.value);
            if (pressType == PressTypes.Pressed) return Input.GetButton(buttonName.value);
            return false;
        }
    }
}
