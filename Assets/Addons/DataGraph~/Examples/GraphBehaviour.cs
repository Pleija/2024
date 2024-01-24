using GraphProcessor;
using UnityEngine;

namespace Nodes.Examples
{
    [ExecuteAlways]
    public class GraphBehaviour : MonoBehaviour
    {
        public BaseGraph graph;

        protected virtual void OnEnable()
        {
            if (graph == null) graph = ScriptableObject.CreateInstance<BaseGraph>();
            graph.LinkToScene(gameObject.scene);
        }
    }
}
