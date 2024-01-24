#region
using System.Collections;
using Runner.Tracks;
using UnityEngine;
#endregion

namespace Runner.Obstacles
{
    /// <summary>
    ///     This script is the base class for implemented obstacles.
    ///     Derived classes should take care of spawning any object needed for the obstacles.
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public abstract class Obstacle : MonoBehaviour
    {
        public AudioClip impactedSound;
        public bool isEnemy;
        public int damageValue;
        public virtual void Setup() { }
        public abstract IEnumerator Spawn(TrackSegment segment, float t);

        public virtual void Impacted()
        {
            var anim = GetComponentInChildren<Animation>();
            var audioSource = GetComponent<AudioSource>();
            if (anim != null) anim.Play();

            if (audioSource != null && impactedSound != null) {
                audioSource.Stop();
                audioSource.loop = false;
                audioSource.clip = impactedSound;
                audioSource.Play();
            }
        }
    }
}
