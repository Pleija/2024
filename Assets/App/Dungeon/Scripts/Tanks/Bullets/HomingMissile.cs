using System.Collections;
using UnityEngine;

//component for homing missile that find the target and follow it
namespace TankShooter
{
    public class HomingMissile : BaseBullet {

        public float lifeTime = 8f;       //life time of missile in seconds (missile exlodes when time is up)
        bool isActive = false;            //check missile is started and not finished to move
        bool targetFound = false;         //check the target object found
        Transform targetTransform = null; //transfor of founded object
        float turn = 7f;                  //how fast the missile turns to target
        float maxDistance = 1000f;        //maximum area where to find the target

        // Use this for initialization
        void Start () {
	
        }

        public override void StartMove(Target target) {
            base.StartMove(target);
            if (target == Target.Enemy)                                       //if player fire this missile
                targetTransform = getTargetTransform();                       //find enemy target
            else                                                              //if enemy fire this missile
                targetTransform = GameObject.FindWithTag("Player").transform; //get player as target
            if (targetTransform != null)                                      //check if target found
                targetFound = true;
            isActive = true;
            StartCoroutine(ExplodeAfterSeconds(lifeTime)); //start countdown before explosion
        }

        Transform getTargetTransform() { //needs to find near enemy 
            Transform result = null;
            Vector3 forward = transform.TransformDirection(Vector3.forward); //get forward direction of missile
            //try to find near enemy in front of cannon direction
            float distance = maxDistance;
            foreach (EnemyAI enemy in GameObject.FindObjectsOfType<EnemyAI>()) {
                Vector3 direction = (enemy.transform.position - transform.position);
                if (direction.sqrMagnitude < distance && Vector3.Dot(forward, direction) >= 0f &&
                    isTargetVisible(direction) && enemy.isEnemyAlive()) {
                    distance = direction.sqrMagnitude; //save the current distance
                    result = enemy.transform;          //save the current enemy transform
                }
            }
            //if enemy was found - return it
            if (result != null)
                return result;
            //try to find target behind the cannon direction
            distance = maxDistance;
            foreach (EnemyAI enemy in GameObject.FindObjectsOfType<EnemyAI>()) {
                Vector3 direction = (enemy.transform.position - transform.position);
                if (direction.sqrMagnitude < distance && Vector3.Dot(forward, direction) < 0f &&
                    isTargetVisible(direction) && enemy.isEnemyAlive()) {
                    distance = direction.sqrMagnitude; //save the current distance
                    result = enemy.transform;          //save the current enemy transform
                }
            }
            //return null or enemy behind the cannon
            return result;
        }

        //check that target is visible (not behind the wall)
        bool isTargetVisible(Vector3 directionToTarget) {
            RaycastHit hit;
            if (Physics.Raycast(transform.position, directionToTarget, out hit)) {
                if (hit.collider.tag == "Enemy")
                    return true;
                else
                    return false;
            }
            return false;
        }

        void FixedUpdate() {
            if (isActive) {
                GetComponent<Rigidbody>().velocity = transform.forward * speed * Time.deltaTime; //move missile to forward
                if (targetTransform != null) {                                                   //if target exists - rotate the missile to it
                    Quaternion targetRotation = Quaternion.LookRotation(targetTransform.position - transform.position);
                    GetComponent<Rigidbody>().MoveRotation(Quaternion.RotateTowards(transform.rotation, targetRotation, turn));
                } else if (targetFound && targetTransform == null) { //if target blown with other bullet - explode the missile
                    if (isActive) {
                        isActive = false;
                        Explode();
                    }
                }
            }
        }

        //check collision of missile with game objects
        void OnCollisionEnter(Collision collision) {
            if (!isActive)
                return;
            isActive = false;
            CheckCollisionWithGameObjects(collision, true);
        }

        //needed to explode the missile after life time
        IEnumerator ExplodeAfterSeconds(float seconds) {
            yield return new WaitForSeconds(seconds);
            if (isActive) {
                isActive = false;
                Explode();
            }
        }

    }
}
