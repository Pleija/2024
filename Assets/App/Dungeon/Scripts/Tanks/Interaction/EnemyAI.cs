using System.Collections;
using System.Collections.Generic;
using UnityEngine;

//AI component for enemy tanks
namespace TankShooter
{
    public class EnemyAI : MonoBehaviour {

        public Transform body;                  //body of the enemy tank (with collider)
        public Cannon cannon;                   //cannon of the enemy tank
        public GameObject explosionPrefab;      //prefab with explosion particle system
        public int lifes = 1;                   //enemy's lifes
        public float minMoveDistance = 1f;      //minimum distance (in units) to move the enemy
        public float maxMoveDistance = 15f;     //maximum distance (in units) to move the enemy
        public float enemyMoveSpeed = 100f;     //speed of moving the enemy
        public float bodyRotationSpeed = 10f;   //speed of rotation to direction of body
        public float cannonRotationSpeed = 15f; //speed of rotation to direction of cannon
        public float minFireRate = 2f;          //minimum delay before next shoot (in seconds)
        public float maxFireRate = 4f;          //maximum delay before next shoot (in seconds)
        public bool chasePlayer = false;        //when true - the enemy follow the player when it's visible
        Gameplay gameplay;                      //main game component
        float viewDistance = 100f;              //maximum distance at which the enemy can see the player
        float moveError = 0.05f;                //maximum difference between enemy and target positions to change waypoint
        Vector3 bodyDirection = Vector3.zero;
        Vector3 cannonDirection = Vector3.zero;
        Vector3 targetWayPoint;       //the world point to which the enemy must move
        bool isAlive = true;          //check is enemy not blown
        bool hasTargetPoint = false;  //check if target point found
        bool playerVisible = false;   //check if player visible by enemy
        bool canFire = true;          //check if firing available
        bool hasMortarCannon = false; //check if enemy's cannon has mortar bombs
        Transform player => TankController.instance ? TankController.instance.transform : null;
        Vector3[] directions; //moving directions

        // Use this for initialization
        void Start () {
            gameplay = GameObject.FindObjectOfType<Gameplay>();
            //player = GameObject.FindObjectOfType<TankController>().transform;    //find player transform on scene
            hasMortarCannon = cannon.bulletType == Cannon.BulletType.MortarBomb; //check bullet type
            CalculateDirections();                                               //calculate moving directions
            ChangeTargetWayPoint();                                              //find next point to move
        }

        void CalculateDirections() {
            //get 16 moving directions for realism (you can use less directions to improve performance)
            directions = new Vector3[] { Vector3.forward,
                Vector3.back,
                Vector3.left,
                Vector3.right,
                getSum(Vector3.forward, Vector3.left),
                getSum(Vector3.forward, Vector3.right),
                getSum(Vector3.back, Vector3.left),
                getSum(Vector3.back, Vector3.right),
                getSum(Vector3.forward, getSum(Vector3.forward, Vector3.left)),
                getSum(Vector3.forward, getSum(Vector3.forward, Vector3.right)),
                getSum(getSum(Vector3.forward, Vector3.left), Vector3.left),
                getSum(getSum(Vector3.forward, Vector3.right), Vector3.right),
                getSum(Vector3.back, getSum(Vector3.back, Vector3.left)),
                getSum(Vector3.back, getSum(Vector3.back, Vector3.right)),
                getSum(getSum(Vector3.back, Vector3.left), Vector3.left),
                getSum(getSum(Vector3.back, Vector3.right), Vector3.right)
            };
        }

        //returns sum of two vectors (vector between these vectors) - needed to find diagonal directions
        Vector3 getSum(Vector3 v1, Vector3 v2) {
            return (v1 + v2).normalized;
        }

        // Update is called once per frame
        void Update () {
            if (!gameplay.isPlaying() || !isAlive || !player)  //if game not started or finished - ignore update
                return;
            if (hasTargetPoint) { //rotate body to target point
                RotateToDirection(body, bodyDirection, bodyRotationSpeed);
            }
            bool playerWasVisible = playerVisible;
            playerVisible = isPlayerVisible();
            //if player became visible - start fire after 0.5-1 second
            if (!playerWasVisible && playerVisible && canFire) {
                StartCoroutine(FireDelay(0.5f, 1f));
            }
            Vector3 dirToPlayer = getDirectionToPlayer();
            if (!hasMortarCannon) {  //check if bullet type not need the target point
                if (playerVisible) { //rotate enemy's cannon to player if visible
                    RotateToDirection(cannon.transform, dirToPlayer, cannonRotationSpeed);
                    if (canFire) { //fire to player if firing enabled
                        cannon.Fire();
                        StartCoroutine(FireDelay(minFireRate, maxFireRate));
                    }
                } else { //rotate cannon in body direction if player not visible
                    RotateToDirection(cannon.transform, bodyDirection, cannonRotationSpeed);
                }
            } else { //for mortar bombs or similar
                RotateToDirection(cannon.transform, dirToPlayer, cannonRotationSpeed);
                if (canFire) {
                    cannon.Fire(player.position);
                    StartCoroutine(FireDelay(minFireRate, maxFireRate));
                }
            }
            //if enemy should follow the player - change body direction to player
            if (chasePlayer && playerVisible) {
                bodyDirection = dirToPlayer;
            }
        }

        void FixedUpdate() {
            if (!gameplay.isPlaying() || !isAlive) { //stop to move rigidbody if game is not playing
                if (GetComponent<Rigidbody>().velocity != Vector3.zero)
                    GetComponent<Rigidbody>().velocity = Vector3.zero;
                return;
            }
            //move the enemy to target point
            if (hasTargetPoint) {
                if (Vector3.Distance(body.position, targetWayPoint) >= moveError) {
                    Vector3 dir = bodyDirection;
                    dir.y = 0;
                    GetComponent<Rigidbody>().velocity = dir * enemyMoveSpeed * Time.deltaTime;
                    //Debug.Log(rigidbody.velocity.x + " " + rigidbody.velocity.y + " " + rigidbody.velocity.z);
                } else {
                    GetComponent<Rigidbody>().velocity = Vector3.zero;
                    hasTargetPoint = false;
                }
            } else { //if enemy achieved target point - find next point
                ChangeTargetWayPoint();
            }
        }

        //makes smooth rotation of transform to direction
        void RotateToDirection(Transform _transform, Vector3 direction, float rotationSpeed) {
            if (direction != Vector3.zero) {
                Quaternion qTo = Quaternion.LookRotation(direction);
                _transform.rotation = Quaternion.Slerp(_transform.rotation, qTo, rotationSpeed * Time.deltaTime);
            }
        }

        //check the player visibility by enemy using raycast
        bool isPlayerVisible()
        {
            if (!player) return false;
            RaycastHit hit;
            int layerMask = ~((1 << LayerMask.NameToLayer("Enemy")) |
                (1 << LayerMask.NameToLayer("EnemyBullet")) |
                (1 << LayerMask.NameToLayer("PlayerBullet"))); //cast all layers except enemy and bullets
            if (Physics.Raycast(body.position, getDirectionToPlayer(), out hit, viewDistance, layerMask)) {
                if (hit.collider.tag == "Player")
                    return true;
                else
                    return false;
            }
            return false;
        }

        //calculate direction from enemy's body to player
        Vector3 getDirectionToPlayer() {
            return (player.position - body.position).normalized;
        }

        //find next point to move from directions
        Vector3 findTargetWayPoint() {
            List<Vector3> points = new List<Vector3>(); //list of points to move
            //find points in all directions
            for (int i = 0; i < directions.Length; i++) {
                Vector3 point = getDistantPoint(body.transform.position, directions[i]);
                if (point != Vector3.zero)
                    points.Add(point);
            }
            //if found at least one point - choose one of them randomly
            if (points.Count > 0) {
                Vector3 randomPoint = points[Random.Range(0, points.Count)];
                randomPoint.y = transform.position.y;
                return randomPoint;
            } else //if points not found - return current position (try to decrease minMoveDistance)
                return transform.position;
        }

        //get distant point in direction using raycast
        Vector3 getDistantPoint(Vector3 origin, Vector3 dir) {
            RaycastHit hit;
            Vector3 direction = transform.TransformDirection(dir);
            float distance = Mathf.Infinity;
            float halfSizeZ = body.GetComponent<Collider>().bounds.size.z/2;
            if (Physics.Raycast(origin, direction, out hit, maxMoveDistance)) {
                distance = hit.distance; //save the distance to obstacle
            }
            if (distance != Mathf.Infinity) {    //if ray reached obstacle
                if (distance >= minMoveDistance) //and if this obstacle not very far to enemy
                    //return random point in this direction
                    return origin + direction.normalized * Random.Range(minMoveDistance, distance - halfSizeZ);
                else
                    return Vector3.zero; //means that enemy can't move in this direction
            }
            else {
                //if no any obstacles - enemy can move to max distance in this direction
                return origin + direction.normalized * (maxMoveDistance - halfSizeZ);
            }
        }


        //finds the next point to mve
        void ChangeTargetWayPoint() {
            hasTargetPoint = false;
            targetWayPoint = findTargetWayPoint();
            bodyDirection = (targetWayPoint - transform.position).normalized;
            hasTargetPoint = true;
        }

        void OnCollisionEnter(Collision collision) {
            //change the moving point when collides with obstacles or other enemies
            if (collision.collider.tag == "Bound"
                || collision.collider.tag == "Enemy"
                || collision.collider.tag == "Breakable") {
                ChangeTargetWayPoint();
            }
        }

        void OnCollisionStay(Collision collision) {
            //change the moving point when collides with obstacles or other enemies
            if (collision.collider.tag == "Bound"
                || collision.collider.tag == "Enemy"
                || collision.collider.tag == "Breakable") {
                ChangeTargetWayPoint();
            }
        }

        IEnumerator FireDelay(float minDelay, float maxDelay) {
            canFire = false;
            yield return new WaitForSeconds(Random.Range(minDelay, maxDelay)); //delay before next shoot
            canFire = true;
        }

        //called to hurt the enemy
        public void AddDamage(int power) {
            lifes -= power;
            if (lifes <= 0)  { //blow up the enemy if no more lifes
                Explode();
            }
        }

        void Explode() {
            if (!isAlive)
                return;
            isAlive = false;
            if (GetComponent<AudioSource>() != null && PlayerPrefs.GetInt("sound_enabled", 1) == 1) //play explosion sound if enabled
                GetComponent<AudioSource>().Play();
            body.GetComponent<Collider>().enabled = false; //disable collision of enemy
            //hide enemy tank
            foreach (Renderer renderer in GetComponentsInChildren<Renderer>())
                renderer.enabled = false;
            //show explosion
            GameObject explosion = (GameObject) Instantiate(explosionPrefab, transform.position, Quaternion.identity);
            Destroy(explosion, 2);
            Destroy(this.gameObject, 3);
            GameObject.FindObjectOfType<Gameplay>().DecreaseEnemiesCount();
        }

        public bool isEnemyAlive() {
            return this.isAlive;
        }

    }
}
