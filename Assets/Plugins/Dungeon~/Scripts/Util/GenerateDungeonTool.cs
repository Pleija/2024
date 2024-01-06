using UnityEngine;
using UnityEngine.UI;

namespace Dungeon
{
    /**
 * Script used on the Dungeon Generator Demo
 */
    public class GenerateDungeonTool : MonoBehaviour {

        //Will move to make all the dungeon appear on this camera.
        public Camera cameraFollow;

        //Size of the dungeon on X axis
        public InputField xSize;
        //Size of the dungeon on z axis
        public InputField zSize;

    
        //Generate a new dungeon 
        public void Generate()
        {
            //Get the X and Z size for the dungeon
            int x = int.Parse(xSize.text);
            int z = int.Parse(zSize.text);

            //Set the sizes for the generator
            DungeonGenerator.instance.xSize = x;
            DungeonGenerator.instance.zSize = z;
         
            //Generate the dungeon
            DungeonGenerator.instance.GenerateDungeon();

            //Make the camera show all the new dungeon.
            cameraFollow.transform.position = new Vector3(x * 5, 10, z * 5);
            cameraFollow.orthographicSize = Mathf.Max(x, z) * 5;
        }

    }
}
