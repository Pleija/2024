#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("GameObject")]
    public class CreatePrimitive : ActionTask
    {
        public BBParameter<string> objectName;
        public BBParameter<Vector3> position;
        public BBParameter<Vector3> rotation;

        [BlackboardOnly]
        public BBParameter<GameObject> saveAs;

        public BBParameter<PrimitiveType> type;

        protected override void OnExecute()
        {
            var newGO = GameObject.CreatePrimitive(type.value);
            newGO.name = objectName.value;
            newGO.transform.position = position.value;
            newGO.transform.eulerAngles = rotation.value;
            saveAs.value = newGO;
            EndAction();
        }
    }
}
