#region
using System.Collections.Generic;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Utility"),
     Description(
         "Send a Graph Event to multiple gameobjects which should have a GraphOwner component attached.")]
    public class SendEventToObjects : ActionTask
    {
        [RequiredField]
        public BBParameter<string> eventName;

        [RequiredField]
        public BBParameter<List<GameObject>> targetObjects;

        protected override string info =>
                string.Format("Send Event [{0}] to {1}", eventName, targetObjects);

        protected override void OnExecute()
        {
            foreach (var target in targetObjects.value)
                if (target != null) {
                    var owner = target.GetComponent<GraphOwner>();
                    if (owner != null) owner.SendEvent(eventName.value, null, this);
                }
            EndAction();
        }
    }

    ///----------------------------------------------------------------------------------------------
    [Category("✫ Utility"),
     Description(
         "Send a Graph Event to multiple gameobjects which should have a GraphOwner component attached.")]
    public class SendEventToObjects<T> : ActionTask
    {
        [RequiredField]
        public BBParameter<string> eventName;

        public BBParameter<T> eventValue;

        [RequiredField]
        public BBParameter<List<GameObject>> targetObjects;

        protected override string info => string.Format("Send Event [{0}]({1}) to {2}", eventName,
            eventValue, targetObjects);

        protected override void OnExecute()
        {
            foreach (var target in targetObjects.value) {
                var owner = target.GetComponent<GraphOwner>();
                if (owner != null) owner.SendEvent(eventName.value, eventValue.value, this);
            }
            EndAction();
        }
    }
}
