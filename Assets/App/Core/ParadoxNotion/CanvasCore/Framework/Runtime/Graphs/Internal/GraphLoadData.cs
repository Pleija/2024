#region
using System.Collections.Generic;
using UnityEngine;
#endregion

namespace NodeCanvas.Framework.Internal
{
    /// <summary>
    ///     Contains data that a graph can load/deserialize from AND initialize. Can be passed to
    ///     Graph.LoadOverwrite or
    ///     Graph.LoadOverwriteAsync
    /// </summary>
    public struct GraphLoadData
    {
        public GraphSource source;
        public string json;
        public List<Object> references;
        public Component agent;
        public IBlackboard parentBlackboard;
        public bool preInitializeSubGraphs;
    }
}
