using UnityEngine;

/*
 * Set a chance that a object will be destroyed On Awake
 */
namespace Dungeon
{
    public class SpawnChance : MonoBehaviour {
        //How much chance this object have to be spawned
        [Range(0, 1f)]
        public float chanceTospawn = 1f;

        //The object will be spawned?
        protected bool isSpawned;

        protected virtual void Awake () {
            //It will spawn?
            isSpawned = Random.Range(0, 1f) < chanceTospawn;
            //If not, destroy the object
            if (!isSpawned)
            {
                Destroy(gameObject);
            }
        }
	
	
    }
}
