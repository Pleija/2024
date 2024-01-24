#region
using System;
using UnityEngine;
#endregion

namespace NodeCanvas.Framework.Internal
{
    /// <summary>
    ///     Used to map subgraph variables <-> parent variables (or direct value)
    /// </summary>
    [Serializable]
    public class BBMappingParameter : BBObjectParameter
    {
        [SerializeField]
        private string _targetSubGraphVariableID;

        [SerializeField]
        private bool _canRead;

        [SerializeField]
        private bool _canWrite;

        public BBMappingParameter() { }

        public BBMappingParameter(Variable subVariable)
        {
            _targetSubGraphVariableID = subVariable.ID;
            SetType(subVariable.varType);
        }

        public string targetSubGraphVariableID => _targetSubGraphVariableID;

        public bool canRead {
            get => _canRead;
            set => _canRead = value;
        }

        public bool canWrite {
            get => _canWrite;
            set => _canWrite = value;
        }
    }
}
