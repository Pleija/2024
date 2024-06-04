using UnityEngine;

/*
 * Move a camera using the mouse and keyboard
 */
namespace Dungeon
{
    public class MoveCamera : MonoBehaviour {

	
        void Update () {
            // If Right Button is clicked Camera will move.
            if(Input.GetMouseButton(0) || Input.GetMouseButton(1))
            {
                float h = 2 * Input.GetAxis("Mouse Y");
                float v = 2 * Input.GetAxis("Mouse X");
                transform.Translate(v, h, 0); 
            }

            //Translate the camera using the Horizontal and Vertical axis
            transform.Translate(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical"), 0);
        

            //Use the mouse scroll to zoom
            float scroll = Input.GetAxis("Mouse ScrollWheel");
            GetComponent<Camera>().orthographicSize -= 5 * scroll;


        }
    }
}
