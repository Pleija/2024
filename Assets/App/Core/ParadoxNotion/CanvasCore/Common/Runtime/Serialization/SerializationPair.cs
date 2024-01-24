#region
using System;
using System.Collections.Generic;
using Object = UnityEngine.Object;
#endregion

namespace ParadoxNotion.Serialization
{
    [Serializable]
    ///<summary>A pair of JSON and UnityObject references</summary>
    public sealed class SerializationPair
    {
        public string _json;
        public List<Object> _references;
        public SerializationPair() => _references = new List<Object>();
    }
}
