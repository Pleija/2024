using System.Collections;
using UnityEngine;

//A static, non-moving obstacle that disappears on its own after a while
namespace Royale
{
    public class Obstacle : Placeable
    {
        [HideInInspector]
        public float timeToRemoval;

        private AudioSource audioSource;

        private void Awake()
        {
            pType = PlaceableType.Obstacle;
            faction = Faction.None; //faction is always none for Obstacles
            audioSource = GetComponent<AudioSource>();
        }

        public void Activate(PlaceableData pData)
        {
            timeToRemoval = pData.lifeTime;
            dieAudioClip = pData.dieClip;
            //TODO: add more as necessary
            StartCoroutine(Die());
        }

        private IEnumerator Die()
        {
            yield return new WaitForSeconds(timeToRemoval);

            //audioSource.PlayOneShot(dieAudioClip, 1f);
            if (OnDie != null)
                OnDie(this);
            Destroy(gameObject);
        }
    }
}