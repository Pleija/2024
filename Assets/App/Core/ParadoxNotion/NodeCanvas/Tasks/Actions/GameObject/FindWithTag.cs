#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("GameObject")]
    public class FindWithTag : ActionTask
    {
        [BlackboardOnly]
        public BBParameter<GameObject> saveAs;

        [RequiredField, TagField]
        public string searchTag = "Untagged";

        protected override string info => "GetObject '" + searchTag + "' as " + saveAs;

        protected override void OnExecute()
        {
            saveAs.value = GameObject.FindWithTag(searchTag);
            EndAction();
        }
    }
}
