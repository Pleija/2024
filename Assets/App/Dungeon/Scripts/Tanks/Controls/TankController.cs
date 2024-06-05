using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

//component used to control the tank by player
namespace TankShooter
{
    public class TankController : MonoBehaviour
    {

        public static TankController instance;
        public Transform body;                  //body of the tank (with collider)
        public Cannon cannon;                   //cannon of the tank
        public GameObject explosionPrefab;      //prefab with explosion particle system
        public int lifes = 3;                   //player's lifes
        public float tankMoveSpeed = 200f;      //speed of tank move
        public float bodyRotationSpeed = 10f;   //speed of rotation to direction of body
        public float cannonRotationSpeed = 15f; //speed of rotation to direction of cannon
        public Joystick leftJoystick;           //joystick to move the tank (for mobile controls)
        public Joystick rightJoystick;          //joystick to rotate the tank's cannon (for mobile controls)
        public zFrame.UI.Joystick joystick;
        // public float speed = 5;
        // CharacterController controller;
        Vector3 bodyDirection = Vector3.zero;
        Vector3 cannonDirection = Vector3.zero;
        Gameplay gameplay;   //main game component
        bool isAlive = true; //check if the player's tank not blown
        LifeBar lifeBar;     //object that display current lifes of player

        private void Awake()
        {
            instance = this;
        }

        void Start () {
            gameplay = GameObject.FindObjectOfType<Gameplay>();
            lifeBar = GameObject.FindObjectOfType<LifeBar>();
//#if !UNITY_EDITOR && (UNITY_ANDROID || UNITY_IPHONE || UNITY_WP8)
			//if control type is joystick+touch - disable second joystick
			if (PlayerPrefs.GetInt("control_type", 1) == 1) {
				rightJoystick.gameObject.SetActive(false);
			}
//#else
            //hide joysticks when run on PC/Web
            // if (leftJoystick != null)
            //     leftJoystick.gameObject.SetActive(false);
            // if (rightJoystick != null)
            //     rightJoystick.gameObject.SetActive(false);
//#endif
        }

        public void OnJoystickValueChanged(Vector2 v)
        {
            // controller = GetComponent<CharacterController>();
            // joystick.OnValueChanged.AddListener(v => {
            if (v.magnitude != 0) {
                Vector3 direction = new Vector3(v.x, 0, v.y);
                //controller.Move(direction * speed * Time.deltaTime);
                transform.rotation = Quaternion.LookRotation(new Vector3(v.x, 0, v.y));
            }
            // });
        }

        /* gravity for both Axis is changed to 10 to prevent gliding on release buttons.
		 * You can enable gliding, just go to Edit -> ProjectSettings -> Input and
		 * in Axis->Horizontal and Axis->Vertical set Gravity value to 1*/
        void Update () {
            //if game is not started or player tanks blown - do nothing
            if (gameplay.getGameState() == Gameplay.GameState.None || !isAlive)
                return;
#if !UNITY_EDITOR && (UNITY_ANDROID || UNITY_IPHONE || UNITY_WP8)
		//mobile controls
		bodyDirection = getDirectionFromJoystick(leftJoystick);
		if (PlayerPrefs.GetInt("control_type", 1) == 2) { //rotate cannon with right joystick
			cannonDirection = getDirectionFromJoystick(rightJoystick).normalized;
			RotateToDirection(cannon.transform, cannonDirection, cannonRotationSpeed);
		}

		foreach (Touch touch in Input.touches) {
			if (isJoystickTouched(touch.position)) //ignore touches over joystick
			    continue;
			if (touch.phase == TouchPhase.Began) {
				if (PlayerPrefs.GetInt("control_type", 1) == 1) {
					cannonDirection = getCannonDirection(touch.position);
					cannon.transform.rotation = Quaternion.LookRotation(cannonDirection); //rotate cannon to touch position
				}
				//start fire
				if (cannon.bulletType != Cannon.BulletType.MortarBomb)
					cannon.Fire();
				else
					cannon.Fire(getWorldPoint(touch.position));
				break;
			}
		}
#else
            // PC / Webplayer controls
            bodyDirection = getBodyDirection();
            cannonDirection = getCannonDirection(Input.mousePosition);
            RotateToDirection(cannon.transform, cannonDirection, cannonRotationSpeed); //rotate cannon to mouse direction
            if (Input.GetMouseButtonDown(0)) {                                         //start fire on mouse left button up
                if (cannon.bulletType != Cannon.BulletType.MortarBomb)
                    cannon.Fire();
                else
                    cannon.Fire(getWorldPoint(Input.mousePosition));
            }
#endif
            //rotate tank body to moving direction
            RotateToDirection(body, bodyDirection, bodyRotationSpeed);

        }

        void FixedUpdate() {
            //move the tank if it's alive
            if (isAlive)
                GetComponent<Rigidbody>().velocity = bodyDirection * tankMoveSpeed * Time.deltaTime;
            else
                GetComponent<Rigidbody>().velocity = Vector3.zero;
        }

        //get body direction from keyboard axis
        Vector3 getBodyDirection() {
            float hOffset = Input.GetAxis("Horizontal");
            float vOffset = Input.GetAxis("Vertical");
            return new Vector3(hOffset, 0, vOffset).normalized;
        }

        //returns cannon directionn to target vector
        Vector3 getCannonDirection(Vector3 target) {
            return getWorldPoint(target) - transform.position;
        }

        //converts screen to world point on specific height
        Vector3 getWorldPoint(Vector3 screenPoint) {
            Ray ray = Camera.main.ScreenPointToRay(screenPoint);
            Plane plane = new Plane(Vector3.up, transform.position);
            float distance = 0;
            if (plane.Raycast(ray, out distance)){
                return ray.GetPoint(distance);
            }
            return Vector3.zero;
        }

        //makes smooth rotation of transform to direction
        void RotateToDirection(Transform _transform, Vector3 direction, float rotationSpeed) {
            if (direction != Vector3.zero) {
                Quaternion qTo = Quaternion.LookRotation(direction);
                _transform.rotation = Quaternion.Slerp(_transform.rotation, qTo, rotationSpeed * Time.deltaTime);
            }
        }

        //returns vector from joystick's offset
        Vector3 getDirectionFromJoystick(Joystick joystick) {
            if (joystick.isMoving) {
                float hOffset = joystick.offset.x;
                float vOffset = joystick.offset.y;
                return new Vector3(hOffset, 0, vOffset);
            } else {
                return Vector3.zero;
            }
        }

        //check if touch over joystick
        bool isJoystickTouched(Vector3 touchPosition) {
            var pointer = new PointerEventData(EventSystem.current);
            // convert to a 2D position
            pointer.position = touchPosition;
            var raycastResults = new List<RaycastResult>();
            EventSystem.current.RaycastAll(pointer, raycastResults);
            foreach (RaycastResult result in raycastResults) {
                if (result.gameObject.tag == "Joystick")
                    return true;
            }
            return false;
        }

        //used to hurt the player's tank by enemy
        public void AddDamage(int power) {
            lifes -= power;          //decrease lifes
            lifeBar.HideLife(lifes); //hide lifes from lifebar
            if (lifes <= 0) {        //if all lifes over - show game over message and explode tank
                gameplay.SetGameOver(false, 1.5f);
                Explode();
            }
        }

        void Explode() {
            if (!isAlive)
                return;
            isAlive = false;                                                                        //mark player as dead
            if (GetComponent<AudioSource>() != null && PlayerPrefs.GetInt("sound_enabled", 1) == 1) //play explosion sound
                GetComponent<AudioSource>().Play();
            body.GetComponent<Collider>().enabled = false; //disable collider of tank
            //hide tank
            foreach (Renderer renderer in GetComponentsInChildren<Renderer>())
                renderer.enabled = false;
            //show explosion particle system
            GameObject explosion = (GameObject) Instantiate(explosionPrefab, transform.position, Quaternion.identity);
            Destroy(explosion, 2);
        }

    }
}
