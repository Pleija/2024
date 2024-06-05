using System.Collections;
using UnityEngine;

//component for cannon of tank
namespace TankShooter
{
    public class Cannon : MonoBehaviour {

        //types of bullets
        public enum BulletType {
            BounceBullet, MortarBomb, HomingMissile, Mine
        }

        public BaseBullet.Target target;      //target object of fired bullets
        public BulletType bulletType;         //type of firing bullets
        public GameObject bulletPrefab;       // bullet object
        public Transform[] bulletStartPoints; //points from which the bullets start to move (1 point - 1 bullet)
        public Material bulletTrailMaterial;  //material for bullet trail (needed to make trails with different colors)
        public GameObject flashPrefab;        //particle system of flash effect when fire
        public Transform[] flashPoints;       //points where to show flash effects (should be near the bullet start points)
        public int maxShootsInRow = 3;        //max count of bullets fired before long reload
        int shootsToReload;
        bool isReloading = false;
        float reloadTime = 0.7f; //delay between shoots when reloading
        Gameplay gameplay;       //main game component

        // Use this for initialization
        void Start () {
            gameplay = GameObject.FindObjectOfType<Gameplay>(); 
            shootsToReload = maxShootsInRow;
        }

        //called to fire
        public void Fire() {
            if (isReloading || !gameplay.isPlaying()) //can't fire if now is reloading or not playing
                return;
            //show flash effects
            for (int i = 0; i < flashPoints.Length; i++) {
                GameObject flashEffect = Instantiate(flashPrefab, flashPoints[i].position, flashPoints[i].rotation) as GameObject;
                Destroy(flashEffect, 2);
            }
            //show and move the bullets
            for (int i = 0; i < bulletStartPoints.Length; i++) {
                GameObject bulletObject = Instantiate(bulletPrefab, bulletStartPoints[i].position, bulletStartPoints[i].rotation) as GameObject;
                if (bulletType != BulletType.Mine)
                    bulletObject.GetComponent<TrailRenderer>().material = bulletTrailMaterial;
                bulletObject.GetComponent<BaseBullet>().StartMove(target);
            }
            if (GetComponent<AudioSource>() != null && PlayerPrefs.GetInt("sound_enabled", 1) == 1) //play fire sound if enabled
                GetComponent<AudioSource>().Play();
            //check if reload needed
            Reload();
        }

        //called to fire for mortar bombs or similar where target world point needed
        public void Fire(Vector3 targetPoint) {
            if (isReloading || !gameplay.isPlaying()) //can't fire if now is reloading or not playing
                return;
            //show flash effects
            for (int i = 0; i < flashPoints.Length; i++) {
                GameObject flashEffect = Instantiate(flashPrefab, flashPoints[i].position, flashPoints[i].rotation) as GameObject;
                Destroy(flashEffect, 2);
            }
            //show and move the bullets
            for (int i = 0; i < bulletStartPoints.Length; i++) {
                GameObject bulletObject = Instantiate(bulletPrefab, bulletStartPoints[i].position, bulletStartPoints[i].rotation) as GameObject;
                bulletObject.GetComponent<TrailRenderer>().material = bulletTrailMaterial;
                bulletObject.GetComponent<BaseBullet>().StartMove(target, targetPoint);
            }
            if (GetComponent<AudioSource>() != null && PlayerPrefs.GetInt("sound_enabled", 1) == 1) //play fire sound if enabled
                GetComponent<AudioSource>().Play();
            //check if reload needed
            Reload();
        }
	
        void Reload() {
            shootsToReload--;
            if (shootsToReload == 0) { //if no more available bullets - start reloading
                shootsToReload = maxShootsInRow;
                StartCoroutine(Reloading());
            }
        }
	
        IEnumerator Reloading() {
            isReloading = true;
            yield return new WaitForSeconds(reloadTime); //disable firing for this time
            isReloading = false;
        }
    }
}
