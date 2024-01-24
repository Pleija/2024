using GraphProcessor;
using Nodes.Examples.DefaultNodes.Nodes;
using UnityEditor.UIElements;
using UnityEngine.UIElements;

namespace Nodes.Examples.DefaultNodes
{
    [NodeCustomEditor(typeof(SettingsNode))]
    public class SettingsNodeView : BaseNodeView
    {
        protected override bool hasSettings => true;
        private SettingsNode settingsNode;

        public override void Enable()
        {
            settingsNode = nodeTarget as SettingsNode;
            controlsContainer.Add(new Label("Hello World !"));
        }

        protected override VisualElement CreateSettingsView()
        {
            var settings = new VisualElement();
            settings.Add(new EnumField("S", settingsNode.setting));
            return settings;
        }
    }
}
