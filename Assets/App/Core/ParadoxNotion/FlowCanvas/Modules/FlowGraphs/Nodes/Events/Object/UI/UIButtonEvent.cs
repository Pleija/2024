#region
using ParadoxNotion.Design;
using UnityEngine.UI;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("UI Button"), Category("Events/Object/UI"),
     Description("Called when the target UI Button is clicked")]
    public class UIButtonEvent : EventNode<Button>
    {
        private FlowOutput o;

        public override void OnPostGraphStarted()
        {
            ResolveSelf();
            if (!target.isNull) target.value.onClick.AddListener(OnClick);
        }

        public override void OnGraphStoped()
        {
            if (!target.isNull) target.value.onClick.RemoveListener(OnClick);
        }

        protected override void RegisterPorts()
        {
            o = AddFlowOutput("Clicked");
            AddValueOutput("This", () => {
                return target.value;
            });
        }

        private void OnClick()
        {
            o.Call(new Flow());
        }
    }
}
