using UnityEngine;

/*
 * Weapons items, items that give you a weapon once the player get it on the floor.
 */
namespace Dungeon
{
    public class ItemWeaponObj : InteractiveObj{

        //Data of the weapon
        public WeaponBase weaponData;

        public override void Start()
        {
            base.Start();
        }

        //Once the player get it
        public override void PlayerGet()
        {
            base.PlayerGet();
            //get the weapon data that the player is using.
            WeaponBase data = PlayerObj.playerInstance.GetWeapon();
            //Give the weapon on the ground to the player
            PlayerObj.playerInstance.SetWeapon(weaponData);

            //Set this weapon to be the one the player was using
            weaponData = data;
            //Set the new texture for the weapon on the ground.
            graphics.GetComponent<Renderer>().material.mainTexture = data.Image.texture;
        
        }
    }
}
