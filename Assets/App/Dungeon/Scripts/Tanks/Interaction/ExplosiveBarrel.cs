using UnityEngine;

namespace TankShooter
{
    public class ExplosiveBarrel : MonoBehaviour {

        public GameObject explosionPrefab; //explosion effect
        public int power = 1;
        bool exploded = false;

        public void Explode() {
            exploded = true;
            GameObject explosion = (GameObject) Instantiate(explosionPrefab, transform.position, Quaternion.identity);
            Destroy(explosion, 2);
            GetComponent<Renderer>().enabled = false;
            GetComponent<BoxCollider>().enabled = false;
            GetComponent<Animation>().Play("explosion_collider");
            GetComponent<AudioSource>().Play();
            Destroy(this.gameObject, 3);
        }

        void OnTriggerEnter(Collider other) {
            if (!exploded)
                return;
            if (other.tag == "Player") {
                other.transform.parent.GetComponent<TankController>().AddDamage(power);
            } else if (other.tag == "Enemy") {
                other.transform.parent.GetComponent<EnemyAI>().AddDamage(power);
            } else if (other.tag == "Breakable") {
                other.gameObject.GetComponent<BreakableObject>().StartBreak(); //break the object
            }
        }
    }
}
