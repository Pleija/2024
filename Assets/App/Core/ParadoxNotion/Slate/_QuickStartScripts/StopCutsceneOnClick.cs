#region
using UnityEngine;
#endregion

namespace Slate
{
    [AddComponentMenu("SLATE/Stop Cutscene On Click")]
    public class StopCutsceneOnClick : MonoBehaviour
    {
        public Cutscene cutscene;
        public Cutscene.StopMode stopMode;

        private void Reset()
        {
            gameObject.GetAddComponent<Collider>();
        }

        private void OnMouseDown()
        {
            if (cutscene == null) {
                Debug.LogError("Cutscene is not provided", gameObject);
                return;
            }
            cutscene.Stop(stopMode);
        }
    }
}
