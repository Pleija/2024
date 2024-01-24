#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Reflected"),
     Description(
         "Send a Unity message to all game objects with a component of the specified type.\nNotice: This is slow and should not be called per-fame.")]
    public class SendMessageToType<T> : ActionTask where T : Component
    {
        [BlackboardOnly]
        public BBParameter<object> argument;

        [RequiredField]
        public BBParameter<string> message;

        protected override string info => string.Format("Message {0}({1}) to all {2}s", message,
            argument, typeof(T).Name);

        protected override void OnExecute()
        {
            var objects = Object.FindObjectsOfType<T>();

            if (objects.Length == 0) {
                EndAction(false);
                return;
            }
            foreach (var o in objects) o.gameObject.SendMessage(message.value, argument.value);
            EndAction(true);
        }
    }
}
