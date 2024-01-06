using UnityEngine;

namespace Dungeon
{
    /**
 * Use the AudioManager classe to create collections of audios that will be used in the game.
 */
    public class GameAudioManager : MonoBehaviour {

        //Sounds of footsteps
        public AudioManager footstep;
        //Sounds of a weapon hitting something
        public AudioManager weaponHit;
        //Sounds of a door opening
        public AudioManager openDoor;
        //Sounds of a char level uping
        public AudioManager LevelUp;

        //Instance of this object
        protected static GameAudioManager instance;

        void Start()
        {
            //Set the instance as itself
            instance = this;
            //Get the source for the audios
            AudioSource source = GetComponent<AudioSource>();

            //Set the source of all the AudioManagers
            footstep.source = source;
            weaponHit.source = source;
            openDoor.source = source;
            LevelUp.source = source;
        }

        //Play a footstep audio
        public static void PlayFootstep()
        {
            instance.footstep.PlayRandom();
        }

        //Play a weaponHit Audio
        public static void PlayWeaponHit()
        {
            instance.weaponHit.PlayRandom();
        }

        //Play a Door being open
        public static void OpenDoor()
        {
            instance.openDoor.PlayRandom();
        }

        //Play an Level Up Audio
        public static void PlayLevelUp()
        {
            instance.LevelUp.PlayRandom();
        }

    }
}
