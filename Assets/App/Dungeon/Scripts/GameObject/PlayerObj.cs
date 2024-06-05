using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using Joystick = zFrame.UI.Joystick;

namespace Dungeon
{
    /**
 * The character the player will controll, our hero
 */
    public class PlayerObj : KillableObj
    {
        //Instance of the player, for easy access
        public static PlayerObj playerInstance;
        public List<GameObject> prefabs;
        public int currentPrefab = 0;
        public List<GameObject> enemyPrefab;

        //Hearth bar of the player, shown in the HUD
        protected Slider playerHealthBar;

        //Image to the weapon on the HUD
        protected Image weaponImage;

        //测试
        // public Joystick joystick;
        // public float speed = 5;
        // CharacterController controller;

        //Reference for the player status, this way the data can keep after the player is dead;
        public static CharStatus PlayerStatus;

        public override void Start()
        {
            //Set saved status if there is one, to keep all the player info
            if (PlayerStatus != null) status = PlayerStatus;
            base.Start();
            playerInstance = this;

            //Set UI data
            SetScreenStatus();

            //Get UI component for the player health
            playerHealthBar = GameObject.FindGameObjectWithTag("PlayerHeathBar")
                .GetComponent<Slider>();
            //Get the UI component for the weapon image
            weaponImage = GameObject.FindGameObjectWithTag("WeaponShow").GetComponent<Image>();
            weaponImage.sprite = status.weapon.Image;

            //Don't show the small heath bar for the player
            showLifeBar = false;

            //If player level up, call this function
            status.EventLevelUp = OnLevelUp;

            //移动轮盘
            //joystick.OnValueChanged.AddListener(TankController.instance.OnJoystickValueChanged);
            // controller = GetComponent<CharacterController>();
            // joystick.OnValueChanged.AddListener(v => {
            //     if (v.magnitude != 0) {
            //         Vector3 direction = new Vector3(v.x, 0, v.y);
            //         controller.Move(direction * speed * Time.deltaTime);
            //         transform.rotation = Quaternion.LookRotation(new Vector3(v.x, 0, v.y));
            //     }
            // });
        }

        //Called once you level up
        public void OnLevelUp()
        {
            //Create particle for level
            GameObject.Instantiate(ObjectPrefabs.instance.OnLeveup, transform.position + Vector3.up,
                ObjectPrefabs.instance.OnLeveup.transform.rotation);
            //Play audio
            GameAudioManager.PlayLevelUp();

            //Update level on the UI
            SetScreenStatus();
        }

        //Once attack a player
        public override void AttackObj(KillableObj obj, float damage)
        {
            base.AttackObj(obj, damage);
        }

        //Save the player data, can be updated to create a file so you can load it another time.
        public void SaveData()
        {
            PlayerStatus = status;
        }

        //Delete the player data
        public void DeleteData()
        {
            PlayerStatus = null;
        }

        //Update the player GUI
        public override void UpdateGUI()
        {
            base.UpdateGUI();

            if (playerHealthBar != null) {
                playerHealthBar.value = (status.currLife / status.life);
                Vector3 scale = playerHealthBar.transform.localScale;
                scale.x = playerHealthBar.value;
                playerHealthBar.transform.localScale = scale;
            }
        }

        //Set the player weapon
        public override void SetWeapon(WeaponBase weapon)
        {
            base.SetWeapon(weapon);
            //Update the UI sprite image
            weaponImage.sprite = status.weapon.Image;
        }

        public void Update()
        {
            //base.Update();

            //Movement side
            Sides.sideChoices side = Sides.sideChoices.none;
            //Check for inputs and move the player
            if (Input.GetButtonDown("Vertical") && Input.GetAxis("Vertical") > 0)
                side = Sides.sideChoices.up;
            else if (Input.GetButtonDown("Vertical") && Input.GetAxis("Vertical") < 0)
                side = (Sides.sideChoices.down);
            else if (Input.GetButtonDown("Horizontal") && Input.GetAxis("Horizontal") > 0)
                side = (Sides.sideChoices.right);
            else if (Input.GetButtonDown("Horizontal") && Input.GetAxis("Horizontal") < 0)
                side = (Sides.sideChoices.left);

            //Only enter if a side is choosen and there is no action happining.
            if (side != Sides.sideChoices.none && !ObjectManager.IsActionsHapping()) {
                //Check if weapon hit anything to this side
                KillableObj[] killables = status.weapon.Hit(Position(), side);

                //If hit something
                if (killables.Length != 0) {
                    //Play audio
                    GameAudioManager.PlayWeaponHit();
                    //Do damage to all hits
                    for (int i = 0; i < killables.Length; i++)
                        AttackObj(killables[i], status.CalculateAttack());
                }
                //Else move the player
                else {
                    Move(side);
                }

                //Make all the other objects do a turn (Monsters, traps)
                InitStep();
            }

            //Generate a new dungeon
            if (Input.GetKeyDown(KeyCode.R)) {
                DungeonGenerator.instance.GenerateDungeon();
            }

            //Toggle to wait to objects to move to be able to do another turn.
            if (Input.GetKeyDown(KeyCode.T)) {
                ObjectManager.WaitForActionsToFinish = !ObjectManager.WaitForActionsToFinish;
            }

            //Go to the menu
            if (Input.GetKeyDown(KeyCode.Escape)) {
                SceneManager.LoadScene("Menu");
            }
        }

        //Update turn for all the other objects
        public void InitStep()
        {
            UpdateStep();
        }

        //Move the player
        public override void Move(Sides.sideChoices side)
        {
            base.Move(side);

            //Play footstep audio, if there is any
            GameAudioManager.PlayFootstep();

            //There is a item on the ground?
            InteractiveObj item = ObjectManager.GetInteractive(Position());

            //If there is, call the PlayerGet Func
            if (item != null) {
                item.PlayerGet();
            }
        }

        //Called wen player die
        public override void Die()
        {
            //Delete saved data
            DeleteData();

            //Reset dungeon
            DungeonGenerator.instance.level = 1;
            DungeonGenerator.instance.xSize = 3;
            DungeonGenerator.instance.zSize = 1;

            //Generate new dungeon
            FindObjectOfType<DungeonGenerator>().GenerateDungeon();
        }

        //Update data on the screen
        public void SetScreenStatus()
        {
            GameObject.FindGameObjectWithTag("GameStatus").GetComponent<Text>().text =
                "Level: " + status.currLevel + "\n" + "Floor: " + DungeonGenerator.instance.level;
        }

        void Reset()
        {
            ObjType = Type.player;
        }
    }
}
