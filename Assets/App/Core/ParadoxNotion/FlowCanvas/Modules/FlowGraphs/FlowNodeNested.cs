#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using NodeCanvas.Framework.Internal;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace FlowCanvas
{
    [Category("SubGraphs"), Color("ffe4e1")]
    ///<summary>Base for nested graphs</summary>
    public abstract class FlowNodeNested<T> : FlowNode, IGraphAssignable<T> where T : Graph
    {
        [SerializeField]
        private List<BBMappingParameter> _variablesMap;

        public abstract T subGraph { get; set; }
        public abstract BBParameter subGraphParameter { get; }
        public T currentInstance { get; set; }
        public Dictionary<Graph, Graph> instances { get; set; }

        public List<BBMappingParameter> variablesMap {
            get => _variablesMap;
            set => _variablesMap = value;
        }

        Graph IGraphAssignable.subGraph {
            get => subGraph;
            set => subGraph = (T)value;
        }

        Graph IGraphAssignable.currentInstance {
            get => currentInstance;
            set => currentInstance = (T)value;
        }
    }
}
