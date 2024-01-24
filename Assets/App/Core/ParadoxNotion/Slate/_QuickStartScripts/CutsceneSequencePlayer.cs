#region
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
#endregion

namespace Slate
{
    ///<summary>Plays a series of cutscenes in order.</summary>
    public class CutsceneSequencePlayer : MonoBehaviour
    {
        public bool playOnStart = true;
        public List<Cutscene> cutscenes;
        public UnityEvent onFinish;
        private int currentIndex;
        private bool isPlaying;

        private void Start()
        {
            if (playOnStart) Play();
        }

        public void Play()
        {
            if (isPlaying) {
                Debug.LogWarning("Sequence is already playing", gameObject);
                return;
            }

            if (cutscenes.Count == 0) {
                Debug.LogError("No Cutscenes provided", gameObject);
                return;
            }
            isPlaying = true;
            currentIndex = 0;
            MoveNext();
        }

        public void Stop()
        {
            if (isPlaying) {
                isPlaying = false;
                cutscenes[currentIndex].Stop();
            }
        }

        private void MoveNext()
        {
            if (!isPlaying || currentIndex >= cutscenes.Count) {
                isPlaying = false;
                onFinish.Invoke();
                return;
            }
            var cutscene = cutscenes[currentIndex];

            if (cutscene == null) {
                Debug.LogError("Cutscene is null in Cutscene Sequencer", gameObject);
                return;
            }
            currentIndex++;
            cutscene.Play(() => {
                MoveNext();
            });
        }

        public static GameObject Create()
        {
            var go = new GameObject("CutsceneSequencePlayer");
            go.AddComponent<CutsceneSequencePlayer>();
            return go;
        }
    }
}
