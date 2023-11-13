using Sirenix.OdinInspector;
using System;
using System.Collections.Generic;
using UnityEngine.Events;

namespace BetterEvents
{
    [Serializable]
    public struct BetterEvent
    {
        [HideReferenceObjectPicker]
        [ListDrawerSettings(CustomAddFunction = "GetDefaultBetterEvent", OnTitleBarGUI = "DrawInvokeButton")]
        public List<BetterEventEntry> Events;

        UnityEvent m_UnityEvent;

        public UnityEvent uEvent {
            get => m_UnityEvent ??= new UnityEvent();
            set => m_UnityEvent = value;
        }

        public void Invoke() {
            if (Events == null) {
                uEvent.Invoke();
                return;
            }

            for (var i = 0; i < Events.Count; i++) Events[i].Invoke();

            uEvent.Invoke();
        }

        #if UNITY_EDITOR

        BetterEventEntry GetDefaultBetterEvent() {
            return new BetterEventEntry(null);
        }

        void DrawInvokeButton() {
            if (Sirenix.Utilities.Editor.SirenixEditorGUI.ToolbarButton("Invoke")) Invoke();
        }

        #endif
    }
}
