using GraphProcessor;
using Nodes.Examples._03_CustomToolbar;
using UnityEditor;
using UnityEngine;

namespace Nodes.Examples._05_All
{
    public class AllGraphWindow : BaseGraphWindow
    {
        private BaseGraph tmpGraph;
        private CustomToolbarView toolbarView;

        [MenuItem("Window/05 All Combined")]
        public static BaseGraphWindow OpenWithTmpGraph()
        {
            var graphWindow = CreateWindow<AllGraphWindow>();

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
            titleContent = new GUIContent("All Graph");

            if (graphView == null) {
                graphView = new AllGraphView(this);
                toolbarView = new CustomToolbarView(graphView);
                graphView.Add(toolbarView);
            }
            rootView.Add(graphView);
        }

        protected override void InitializeGraphView(BaseGraphView view)
        {
            // graphView.OpenPinned< ExposedParameterView >();
            // toolbarView.UpdateButtonStatus();
        }
    }
}
