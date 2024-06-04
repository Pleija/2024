using UnityEngine;

//component for game object that can be destroyed by bullet
namespace TankShooter
{
    public class BreakableObject : MonoBehaviour {

        public GameObject explosionPrefab; //particle system of explosion

        //needed to destroy this object 
        public void StartBreak() {
            GetComponent<Renderer>().enabled = false;                                                                  //hide object
            GetComponent<Collider>().enabled = false;                                                                  //disable collisions for object
            GameObject explosion = (GameObject) Instantiate(explosionPrefab, transform.position, Quaternion.identity); //show explosion effect
            Destroy(explosion, 3);                                                                                     //remove explosion after 3 seconds
            Destroy(this.gameObject, 1);                                                                               //remove this object after 1 second
        }
    }
}
