using UnityEngine;

namespace Dungeon
{
    /**
 * Audios that the NPC and enemies will use
 */
    public class NPCAudioManager : MonoBehaviour {

        //Sounds of a arrow being shot
        public AudioManager ArrowShot;

        void Start()
        {
            //Get the audio source and add to  the AudioManagers
            AudioSource source = GetComponent<AudioSource>();
            ArrowShot.source = source;
        }

        //Play the sound of a arrow being shot
        public void PlayArrowShot()
        {
            ArrowShot.PlayRandom();
        }
    }
}
