using UnityEngine;
using UnityEngine.Events;
using System.Collections;

namespace Slate
{
    [AddComponentMenu("SLATE/Stop Cutscene On Trigger")]
    public class StopCutsceneOnTrigger : MonoBehaviour
    {
        public Cutscene cutscene;
        public bool checkSpecificTagOnly = true;
        public string tagName = "Player";
        public Cutscene.StopMode stopMode;

        private void OnTriggerEnter(Collider other)
        {
            if (cutscene == null) {
                Debug.LogError("Cutscene is not provided", gameObject);
                return;
            }
            if (checkSpecificTagOnly && !string.IsNullOrEmpty(tagName))
                if (other.gameObject.tag != tagName)
                    return;
            enabled = false;
            cutscene.Stop(stopMode);
        }

        private void Reset()
        {
            var collider = gameObject.GetAddComponent<BoxCollider>();
            collider.isTrigger = true;
        }
    }
}
