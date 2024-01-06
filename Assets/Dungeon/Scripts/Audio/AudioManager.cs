using UnityEngine;

namespace Dungeon
{
    /**
 * Get a collection of AudioClips and manage them
 */
    [System.Serializable]
    public class AudioManager{
    
        //Source that will play the audios of this collection
        [HideInInspector]
        public AudioSource source;
        //Clips that this class will manage
        public AudioClip[] clips;

        //Play a random sound in the source
        public void PlayRandom()
        {
            //If there is any problem, don't play the sound
            if (source == null || source.enabled == false || clips.Length == 0)
                return;

            //Set the source clip with a random clip;
            source.clip = clips[Random.Range(0, clips.Length)];
            //Play the clip
            source.Play();


        }
    }
}
