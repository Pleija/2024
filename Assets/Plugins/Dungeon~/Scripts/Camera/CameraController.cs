using UnityEngine;

namespace Dungeon
{
    public class CameraController : MonoBehaviour {

        //If the camera will follow the target smootly
        public bool smoothCamera = false;
        //The animation curve that the movement will use
        public AnimationCurve smoothMoveCurve;
        //The speed the camera moves
        public float moveSpeed = 0.1f;

        //At distance "maxDistance" will be the start of the animation curve
        protected float maxDistance = 1f;
        //Transform that the camera will follow
        protected Transform follow;
	

        void Start () {
            //If the camera is smooth
            if (smoothCamera)
            {
                //Set the transform to follow, in the regular case the camera will be inside the object to follow.
                follow = transform.parent;
                //Remove the camera from the follow parent, so it can move freely
                transform.parent = null;
            }
        }
	

        void Update () {
            if (!smoothCamera)
                return;

            //If the object it is following don't exist anymore, destroy the camera.
            if(follow == null)
            {
                Destroy(gameObject);
                return;
            }

            //The distance betwen the camera and the object it is following. Don't take in consideration the Y axis.
            float distance = Vector2.Distance(new Vector2(follow.position.x, follow.position.z), new Vector2(transform.position.x, transform.position.z));
        
            if (distance > maxDistance)
                distance = maxDistance;

            //Set the position in the animation curve this frame will get.
            float percentage = distance / maxDistance * moveSpeed;

            //The position that the camera need to be in the end.
            Vector3 finalPos = new Vector3(follow.position.x, transform.position.y, follow.position.z);

            //How much it will move in this frame.
            transform.position = Vector3.Lerp(transform.position, finalPos, percentage);
        }
    }
}
