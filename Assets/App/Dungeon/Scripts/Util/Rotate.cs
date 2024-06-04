using UnityEngine;

/*
 * Keep rotation an object
 */
namespace Dungeon
{
    public class Rotate : MonoBehaviour {

        //Will rotate this value each frame
        public Vector3 rotation;

	
        void Update () {
            //Rotate the object
            transform.Rotate(rotation);
        }
    }
}
