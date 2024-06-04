using UnityEngine;

//component for mortar bomb which flies over an arc
namespace TankShooter
{
    public class MortarBomb : BaseBullet {

        float verticalAngle = 45f; //the angle at which the bomb flies

        // Use this for initialization
        void Start () {
	
        }

        public override void StartMove(Target target, Vector3 targetPoint) {
            base.StartMove(target, targetPoint);
            GetComponent<Rigidbody>().velocity = getVelocity(targetPoint); //calculate the speed to achieve the target point
        }

        Vector3 getVelocity(Vector3 target) {
            Vector3 direction = target - transform.position; // get direction to target
            float height = direction.y;                      // get height diff
            direction.y = 0;                                 // retain only the horizontal direction
            float distance = direction.magnitude;            // get distance to target
            float radAngle = verticalAngle * Mathf.Deg2Rad;  // get angle in radians
            direction.y = distance * Mathf.Tan(radAngle);    // set direction to angle
            distance += height / Mathf.Tan(radAngle);        // correction for small height differences		
            // calculate the velocity 
            float velocity = Mathf.Sqrt(distance * Physics.gravity.magnitude / Mathf.Sin(2 * radAngle));
            if (!float.IsNaN(velocity))                 //if velocity is succesfully calculated
                return velocity * direction.normalized; // return the velocity vector
            else
                return 1f * direction.normalized; //small velocity
        }

        //check the collisions of bomb
        void OnCollisionEnter (Collision collision) {
            CheckCollisionWithGameObjects(collision, true);
        }
    }
}
