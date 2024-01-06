using UnityEngine;

/*
 * Spawn a random GameObject from a spawn pool.
 * It can be set to only have a chance to spawn
 */
namespace Dungeon
{
    public class GameObjectSpawner : SpawnChance {

        //Objects it can spawn
        public GameObject[] SpawnPool;

        protected override void Awake()
        {
            base.Awake();
            //Only spawn the object if the chance to spawn is valid
            if (isSpawned) {
                //Set a random object to spawn
                GameObject chosen = SpawnPool[Random.Range(0, SpawnPool.Length)];
                Instantiate(chosen, transform.position, chosen.transform.rotation, transform.parent);
            }
        }
    }
}
