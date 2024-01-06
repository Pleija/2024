using UnityEngine;

namespace Dungeon
{
    /**
 * Status for a character in the game
 */
    [System.Serializable]
    public class CharStatus{
    
        //Weapon character is using
        public WeaponBase weapon;
    
        //Max life
        public float life = 100;
        //Used to calculate damage
        public float strengh = 5;
        //Used to reduce damage taken
        public float defense = 3;
        //Critical hit and other stuff
        public float luck = 7;
        //How much actions can the character do per turn
        public float speed = 1;

        //How much xp gives once is killed
        public float GiveExpOnKill = 3f;

        //Current life
        public float currLife;

        //How much XP it have
        public float currExp = 0;
        //How much it need to next level
        public float nextLevel = 10;
        //Current level
        public float currLevel = 1;

        //On level, call this is assigned
        public delegate void OnLevelUp();
        public OnLevelUp EventLevelUp;

    

        public void Init()
        {
            //If currLife not set, set it maximum
            if(currLife == 0)
                currLife = life;
        }
        //Get XP
        public void GetExp(float exp)
        {
            currExp += exp;
            if(currExp >= nextLevel)
            {
                LevelUp();
            }
        }

        //Add a level
        public void LevelUp()
        {
            //Add more status for this character
            life *= 1.15f;
            strengh *= 1.1f;
            defense *= 1.1f;
            luck *= 1.1f;

            //Reset current life
            currLife = life;

            //Gain a level
            currLevel++;

            //Need more xp for next level
            nextLevel *= 2;

            if(EventLevelUp != null)
                EventLevelUp();

            //GameObject.Instantiate(ObjectPrefabs.instance.OnLeveup, PlayerObj.playerInstance.transform.position + Vector3.up, ObjectPrefabs.instance.OnLeveup.transform.rotation);
        }

        //How much damage this attack will do
        public float CalculateAttack()
        {
            float attack = weapon.GetAttack() + (strengh * 0.5f);
            if (Random.Range(0, 100) <= luck)
                attack *= 2;
            return attack;
        }
        //How much defense this character have.
        //Could add equipement defense status
        public float CalculateDefense()
        {
            return defense;
        }
        //Calculate how much damage will be done to this character
        public float CalculateDamage(float damage)
        {
            return Mathf.Max(0, damage - CalculateDefense());
        }
        //Take damage from some source
        public void TakeDamage(float damage)
        {
            float trueDamage = CalculateDamage(damage);
            UpdateLife(-trueDamage);
        }

        //Update current life
        public void UpdateLife(float givenLife)
        {
            currLife += givenLife;

            if (currLife > life)
                currLife = life;
            if (currLife < 0)
                currLife = 0;
        }
    }
}
