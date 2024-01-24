#region
using ParadoxNotion.Serialization;
using UnityEngine;
#endregion

namespace NodeCanvas.Framework.Internal
{
    public class MissingVariableType : Variable<object>, IMissingRecoverable
    {
        [SerializeField]
        private string _missingType;

        [SerializeField]
        private string _recoveryState;

        public string missingType {
            get => _missingType;
            set => _missingType = value;
        }

        public string recoveryState {
            get => _recoveryState;
            set => _recoveryState = value;
        }
    }
}
