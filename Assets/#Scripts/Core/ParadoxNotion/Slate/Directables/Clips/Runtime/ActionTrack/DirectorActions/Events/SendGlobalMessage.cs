using UnityEngine;
using System.Collections;
using System.Linq;

namespace Slate.ActionClips
{
    [Category("Events")
     , Description(
         "Send a Unity Message to all actors of this Cutscene, including the Director Camera, as well as the Cutscene itself.")]
    public class SendGlobalMessage : DirectorActionClip, IEvent
    {
        [Required]
        public string message;

        public override string info => string.Format("Global Message\n'{0}'", message);
        public override bool isValid => !string.IsNullOrEmpty(message);
        string IEvent.name => message;

        void IEvent.Invoke()
        {
            OnEnter();
        }

        protected override void OnEnter()
        {
            if (!Application.isPlaying) return;
            root.SendGlobalMessage(message, null);
        }
    }
}
