using UnityEngine;

//base script for bullets, all other bullet scripts should be inherited from this script
namespace TankShooter
{
    public class BaseBullet : MonoBehaviour {

        //needed to determine the target object
        public enum Target {
            Player, Enemy
        }

        public int speed = 100;            //moving speed of bullet
        public int power = 1;              //how much lifes takes the damage by this bullet
        public GameObject explosionPrefab; //prefab of explosion (particle system) for bullet
        protected Target target;           //target type

        //used when the bullet is ready to move
        public virtual void StartMove(Target target) {
            this.target = target;
            SetLayer();
        }

        //used when the bullet is ready to move, taget world point needed
        public virtual void StartMove(Target target, Vector3 targetPoint) {
            this.target = target;
            SetLayer();
        }

        //called when the bullet collides with other gameobject or should be exploded
        protected void Explode() {
            StopAllCoroutines();
            GetComponent<Collider>().enabled = false;          //hide collider of bullet
            GetComponent<Rigidbody>().velocity = Vector3.zero; //reset bullet's speed
            GetComponent<Rigidbody>().Sleep();                 //disable the bullet's physics 
            //show explosion effect
            GameObject explosion = (GameObject) Instantiate(explosionPrefab, transform.position, Quaternion.identity);
            Destroy(explosion, 3); 
            //hide bullet
            foreach (MeshRenderer renderer in GetComponentsInChildren<MeshRenderer>())
                renderer.enabled = false;
            //destroy bullet after 3 seconds
            Destroy(this.gameObject, 3);
        }

        //sets the physics layer of bullet to prevent colliding with unnecessary objects
        void SetLayer() {
            if (target == Target.Enemy) {
                this.gameObject.layer = LayerMask.NameToLayer("PlayerBullet");
            } else if (target == Target.Player) {
                this.gameObject.layer = LayerMask.NameToLayer("EnemyBullet");
            }
        }


        protected void CheckCollisionWithGameObjects(Collision collision, bool destroyAnyway) {
            if (target == Target.Enemy && collision.gameObject.tag == "Enemy") {          //if bullet collides with enemy
                Explode();                                                                //exlode the bullet
                collision.gameObject.GetComponent<EnemyAI>().AddDamage(power);            //hurt the enemy
            } else if (target == Target.Player && collision.gameObject.tag == "Player") { //if bullet collides with player
                Explode();                                                                //exlode the bullet
                collision.gameObject.GetComponent<TankController>().AddDamage(power);     //hurt the player
            } else if (collision.gameObject.tag == "Breakable") {                         //if bullet collides with breakable object
                Explode();                                                                //exlode the bullet
                collision.gameObject.GetComponent<BreakableObject>().StartBreak();        //break the object
            } else if (collision.gameObject.tag == "Explosive") {                         //if bullet collides with explosive barrel object
                Explode();                                                                //exlode the bullet
                collision.gameObject.GetComponent<ExplosiveBarrel>().Explode();           //break the object
            } else if (destroyAnyway)                                                     //if bullet collides with with other object (i.e. wall) and should be destroyed
                Explode();                                                                //exlode the bullet
        } 
    }
}
