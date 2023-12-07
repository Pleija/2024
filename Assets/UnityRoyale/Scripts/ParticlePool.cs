using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace UnityRoyale
{
    public class ParticlePool : MonoBehaviour
    {
        public GameObject effectPrefab;
        public int amount = 10;
        private ParticleSystem[] pool;
        private int currentSystem = 0;

        private void Awake()
        {
            pool = new ParticleSystem[amount];
            for (var i = 0; i < amount; i++)
                pool[i] = Instantiate<GameObject>(effectPrefab, transform).GetComponent<ParticleSystem>();
        }

        public void UseParticles(Vector3 pos)
        {
            currentSystem = currentSystem + 1 >= pool.Length ? 0 : currentSystem + 1;
            pool[currentSystem].transform.position = pos;
            pool[currentSystem].Play();
        }
    }
}
