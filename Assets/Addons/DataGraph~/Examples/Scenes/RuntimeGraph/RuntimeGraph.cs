using GraphProcessor;
using UnityEngine;

namespace Nodes.Examples.Scenes.RuntimeGraph
{
    public class RuntimeGraph : MonoBehaviour
    {
        public BaseGraph graph;
        public ProcessGraphProcessor processor;
        public GameObject assignedGameObject;

        private void Start()
        {
            if (graph != null) processor = new ProcessGraphProcessor(graph);
        }

        private int i = 0;

        private void Update()
        {
            if (graph != null) {
                graph.SetParameterValue("Input", (float)i++);
                graph.SetParameterValue("GameObject", assignedGameObject);
                processor.Run();
                Debug.Log("Output: " + graph.GetParameterValue("Output"));
            }
        }
    }
}
