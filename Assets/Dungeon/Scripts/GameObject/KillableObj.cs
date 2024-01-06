using UnityEngine;
using UnityEngine.UI;

namespace Dungeon
{
    /**
 * All objects that can be killed in the game should use this class.
 */

    public class KillableObj : BaseObj {
        //Status of the object.
        public CharStatus status;

        // UI of the health bar of object
        protected GameObject healthBar;
        // UI of background of the health of the obj.
        protected GameObject healthBarBack;

        //Show the life bar for this object?
        protected bool showLifeBar = true;

        //How much actions does this object have for next turn?
        protected float numberActions = 0;

        public override void Start()
        {
            base.Start();
            //Init the status
            status.Init();
            //Create a health bar in UI
            CreateHealthBar();
            //Update the UI
            UpdateGUI();
            //Set the position a little on top of the ground.
            transform.position = new Vector3(transform.position.x, 0.1f, transform.position.z);
        }

        //Set a new weapon for the OBJ
        public virtual void SetWeapon(WeaponBase weapon)
        {
            status.weapon = weapon;
        }
        //Get the Weapon Data of the OBJ
        public virtual WeaponBase GetWeapon()
        {
            return status.weapon;
        }

        //On its turn, do what?
        public override void OnStep()
        {
            //Number of actions depend of the speed status.
            numberActions += status.speed;
            base.OnStep();
        }

        void OnGUI()
        {
            UpdateGUI();
        }

        public virtual void UpdateGUI()
        {
            //Hide the life bar if full life or don't want the life bar for this obj
            if (!showLifeBar || status.life == status.currLife)
            {
                healthBar.SetActive(false);
                healthBarBack.SetActive(false);
                return;
            }
            //Position the lifebar UI corretly
            healthBar.SetActive(true);
            healthBarBack.SetActive(true);
            healthBar.GetComponent<RectTransform>().anchoredPosition = UIManager.WorldSpace2Canvas(transform.position + (Vector3.forward * 0.75f));
            healthBarBack.GetComponent<RectTransform>().anchoredPosition = UIManager.WorldSpace2Canvas(transform.position + (Vector3.forward * 0.75f));

            //Set the life bar size.
            healthBar.GetComponent<Image>().fillAmount = (status.currLife / (float)status.life);
        }
        //Create the UI for the life bar
        void CreateHealthBar()
        {
            healthBar = UIManager.InstatianteInCanvas(UIManager.instance.ProgressBar.gameObject);
            healthBarBack = UIManager.InstatianteInCanvas(UIManager.instance.ProgressBarBackground.gameObject);


        }

        //Attack a Obj
        public override void AttackObj(KillableObj obj, float damage)
        {
            base.AttackObj(obj, damage);

            //If the Obj is dead, get XP
            if (obj.isDead())
            {
                status.GetExp(obj.status.GiveExpOnKill);
            }
        }

        //Take damage for another OBJ
        public void Damage(float damage)
        {
            //Take damage on status
            status.TakeDamage(damage);

            //Create a box showing the damage on the game.
            //DamageText dmg = Instantiate<DamageText>(UIManager.instance.damageBox, transform.position, Quaternion.identity, UIManager.instance.canvas.transform);
            //dmg.CreateBox((int)status.CalculateDamage(damage));

            //Show life green, unless is low on heath, then show red
            if (status.currLife / (float)status.life > 0.25f)
            {
                healthBar.GetComponent<Image>().color = Color.green;
                healthBarBack.GetComponent<Image>().color = Color.green;
            }
            else
            {
                healthBar.GetComponent<Image>().color = Color.red;
                healthBarBack.GetComponent<Image>().color = Color.red;
            }

            //If is dead (0 life), kill the object
            if (isDead())
            {
                Die();
            }
        }
        //Obj is dead?
        public bool isDead()
        {
            return status.currLife == 0;
        }

        //Kill object
        public virtual void Die()
        {
            //Create a GameObject wen it dies (some particle usually)
            Instantiate(ObjectPrefabs.instance.OnObjectDeath, transform.position, Quaternion.identity);
            Destroy(gameObject);
        }
    
        public override void OnDestroy()
        {
            base.OnDestroy();
            Destroy(healthBar);
            Destroy(healthBarBack);
        }

    }
}
