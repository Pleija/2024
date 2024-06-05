using UnityEngine;

//straight bullet component
namespace TankShooter
{
    public class BounceBullet : BaseBullet {

        public int bounces = 2; //how many times the bullet should be bounced from wall before explode

        // Use this for initialization
        void Start () {
	
        }
	
        // Update is called once per frame
        void Update () {
	
        }

        public override void StartMove(Target target) {
            base.StartMove(target);
            GetComponent<Rigidbody>().AddForce(transform.forward.normalized * speed); //move the bullet in forward direction
        }

        void OnCollisionEnter (Collision collision) {
            if (collision.gameObject.tag == "Bound") { //when the bullet collides with bound (wall)
                bounces--;                             //decrease bounces count
                if (bounces == 0) {                    //if the bullet is ready to explode
                    Explode();                         //explode it
                }
            } else {
                CheckCollisionWithGameObjects(collision, false);
            }
        }
	
        void OnCollisionExit(Collision collision) {
            //change the bullet direction after bounce
            if (collision.gameObject.tag == "Bound" && GetComponent<Rigidbody>().velocity != Vector3.zero) {
                transform.rotation = Quaternion.LookRotation(GetComponent<Rigidbody>().velocity);
            }
        }
    }
}
