using UnityEngine;

namespace Dungeon
{
    /**
 * Objects that are doors in the game
 * Can be extended to locked doors, or similar things
 */

    public class DoorObj : InteractiveObj {
        //The door is opened?
        public bool isOpen = false;

        //If the player touch it, open the door
        public override void PlayerGet()
        {
            base.PlayerGet();
            OpenDoor();
        }
        //If the enemy touch it, open the door
        public override void EnemyGet()
        {
            OpenDoor();
        }

        //Open the door
        public void OpenDoor()
        {
            if (!isOpen)
            {
                //Move the door closer to the wall
                graphics.transform.Translate(Vector3.forward * -0.5f);
                //Rotate the door, to open it
                graphics.transform.Rotate(new Vector3(0, 90, 0));
                isOpen = true;

                //Play the audio of the door opening
                GameAudioManager.OpenDoor();
            }
        }
    }
}
