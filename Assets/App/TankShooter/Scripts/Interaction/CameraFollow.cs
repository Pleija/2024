using UnityEngine;

//component for camera to follow the player
namespace TankShooter
{
    public class CameraFollow : MonoBehaviour {

        public Transform target;     //target to follow
        public float distance = 10f; //horizontal distance to target
        public float height = 5f;    //height over the target
        public float heightDamping = 2f;
        public float rotationDamping = 3f;
	
        void LateUpdate () {
            if (!target) //ignore update if no target
                return;
            // calculate the current rotation angles
            float wantedRotationAngle = target.eulerAngles.y;
            float wantedHeight = target.position.y + height;
            float currentRotationAngle = transform.eulerAngles.y;
            float currentHeight = transform.position.y;
            // damp the rotation around the y-axis
            currentRotationAngle = Mathf.LerpAngle (currentRotationAngle, wantedRotationAngle, rotationDamping * Time.deltaTime);
            // damp the height
            currentHeight = Mathf.Lerp (currentHeight, wantedHeight, heightDamping * Time.deltaTime);
            // convert the angle into a rotation
            Quaternion currentRotation = Quaternion.Euler (0, currentRotationAngle, 0);
            // Set the position of the camera on the x-z plane to:
            // distance meters behind the target
            transform.position = target.position;
            transform.position -= currentRotation * Vector3.forward * distance;
            // set the height of the camera
            Vector3 newPos = transform.position;
            newPos.y = currentHeight;
            transform.position = newPos;
            // Always look at the target
            transform.LookAt (target);
        }
    }
}
