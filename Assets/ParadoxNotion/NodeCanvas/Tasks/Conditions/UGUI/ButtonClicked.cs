using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine.UI;
using UnityEngine;

namespace NodeCanvas.Tasks.Conditions
{
    [Category("UGUI")]
    public class ButtonClicked : ConditionTask
    {
        [RequiredField]
        public BBParameter<Button> button;

        protected override string info => string.Format("Button {0} Clicked", button.ToString());

        protected override string OnInit()
        {
            button.value.onClick.AddListener(OnClick);
            return null;
        }

        protected override bool OnCheck() => false;

        private void OnClick()
        {
            YieldReturn(true);
        }
    }
}
