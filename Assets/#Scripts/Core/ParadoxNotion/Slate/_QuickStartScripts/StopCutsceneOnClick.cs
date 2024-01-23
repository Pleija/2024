using UnityEngine;
using UnityEngine.Events;
using System.Collections;

namespace Slate
{
    [AddComponentMenu("SLATE/Stop Cutscene On Click")]
    public class StopCutsceneOnClick : MonoBehaviour
    {
        public Cutscene cutscene;
        public Cutscene.StopMode stopMode;

        private void OnMouseDown()
        {
            if (cutscene == null) {
                Debug.LogError("Cutscene is not provided", gameObject);
                return;
            }
            cutscene.Stop(stopMode);
        }

        private void Reset()
        {
            gameObject.GetAddComponent<Collider>();
        }
    }
}
