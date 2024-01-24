using GraphProcessor;
using UnityEditor;
using UnityEngine;

namespace Nodes.Examples._04_ExposedProperties
{
    public class ExposedPropertiesGraphWindow : BaseGraphWindow
    {
        private BaseGraph tmpGraph;

        [MenuItem("Window/04 Exposed Properties")]
        public static BaseGraphWindow OpenWithTmpGraph()
        {
            var graphWindow = CreateWindow<ExposedPropertiesGraphWindow>();

            // When the graph is opened from the window, we don't save the graph to disk
            graphWindow.tmpGraph = CreateInstance<BaseGraph>();
            graphWindow.tmpGraph.hideFlags = HideFlags.HideAndDontSave;
            graphWindow.InitializeGraph(graphWindow.tmpGraph);
            graphWindow.Show();
            return graphWindow;
        }

        protected override void OnDestroy()
        {
            graphView?.Dispose();
            DestroyImmediate(tmpGraph);
        }

        protected override void InitializeWindow(BaseGraph graph)
        {
            titleContent = new GUIContent("Properties Graph");
            if (graphView == null) graphView = new ExposedPropertiesGraphView(this);
            rootView.Add(graphView);
        }

        protected override void InitializeGraphView(BaseGraphView view)
        {
            view.OpenPinned<ExposedParameterView>();
        }
    }
}
