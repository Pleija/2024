#region
using System.Collections.Generic;
using System.Linq;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("GameObject"), Description("Action will end in Failure if no objects are found")]
    public class FindAllWithTag : ActionTask
    {
        [BlackboardOnly]
        public BBParameter<List<GameObject>> saveAs;

        [RequiredField, TagField]
        public BBParameter<string> searchTag = "Untagged";

        protected override string info => "GetObjects '" + searchTag + "' as " + saveAs;

        protected override void OnExecute()
        {
            saveAs.value = GameObject.FindGameObjectsWithTag(searchTag.value).ToList();
            EndAction(saveAs.value.Count != 0);
        }
    }
}
