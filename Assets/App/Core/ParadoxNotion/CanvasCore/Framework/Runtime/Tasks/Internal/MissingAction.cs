#region
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization;
using UnityEngine;
#endregion

namespace NodeCanvas.Framework.Internal
{
    ///<summary> Injected when an ActionTask is missing. Recovers back when that ActionTask is found.</summary>
    [DoNotList,
     Description(
         "Please resolve the MissingAction issue by either replacing the action, importing the missing action type, or refactoring the type in GraphRefactor.")]
    public class MissingAction : ActionTask, IMissingRecoverable
    {
        [SerializeField]
        private string _missingType;

        [SerializeField]
        private string _recoveryState;

        protected override string info =>
                ReflectionTools.FriendlyTypeName(_missingType).FormatError();

        string IMissingRecoverable.missingType {
            get => _missingType;
            set => _missingType = value;
        }

        string IMissingRecoverable.recoveryState {
            get => _recoveryState;
            set => _recoveryState = value;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            GUILayout.Label(_missingType.FormatError());
            GUILayout.Label(_recoveryState);
        }
#endif
    }
}
