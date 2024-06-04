using UnityEngine;

namespace Dungeon
{
    /**
 * Once a particle stop emmiting, destroy the object
 */
    public class DestroyOnParticleEnd : MonoBehaviour {

        protected ParticleSystem system;

        void Start () {
            //Get the particle system
            system = GetComponent<ParticleSystem>();
        }
	
        void Update () {
            //Once the particle is stoped, destroy the gameobject
            if (system.isStopped)
                Destroy(gameObject);
        }
    }
}
