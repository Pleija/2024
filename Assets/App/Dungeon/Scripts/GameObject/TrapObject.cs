using UnityEngine;

namespace Dungeon
{
    /**
 * Most traps on the game should use this as base
 */

    public class TrapObject : InteractiveObj {
        //Damage of the trap
        public float damage = 25;
        //How close need to be to attack
        public int distanceToAttack = 7;

        //Projectile the trap will use
        public ProjectileBase AttackInstance;

        //Audios for the trap to play
        public NPCAudioManager npcAudio;

        //Set negative for infinite ammo
        public int ammo = -1;


        public override void OnStep()
        {
            base.OnStep();

            Sides.sideChoices side;
            //If have ammo, try to find player, if find it. Attack
            if(ammo != 0 && (side = IsHit()) != Sides.sideChoices.none)
            {
                //Attack player
                AttackObj(PlayerObj.playerInstance, damage, Sides.SideToVector(side));
                //Remove one ammo
                ammo--;
            }
        }
        //Attack a obj
        public void AttackObj(KillableObj obj, float damage, IntVector2 side)
        {
            //Play arrow audio
            npcAudio.PlayArrowShot();

            //Create the projectile and configure it
            ProjectileBase projectile = Instantiate<ProjectileBase>(AttackInstance, new Vector3(transform.position.x + side.x, transform.position.y, transform.position.z + side.z), Quaternion.identity, transform);
            projectile.parent = this;
            projectile.target = PlayerObj.playerInstance.gameObject;
            projectile.damage = damage;
        }

        //Check if can hit the player
        public Sides.sideChoices IsHit()
        {
            //If see the player down, return down, same for the other directions
            if (CheckForPlayer(Sides.sideChoices.down, Position(), distanceToAttack))
                return Sides.sideChoices.down;
            if (CheckForPlayer(Sides.sideChoices.left, Position(), distanceToAttack))
                return Sides.sideChoices.left;
            if (CheckForPlayer(Sides.sideChoices.right, Position(), distanceToAttack))
                return Sides.sideChoices.right;
            if (CheckForPlayer(Sides.sideChoices.up, Position(), distanceToAttack))
                return Sides.sideChoices.up;
            return Sides.sideChoices.none;
        }

        //Can see the player in a direction?
        public bool CheckForPlayer(Sides.sideChoices side, IntVector2 pos, int distance)
        {
            //If got out of bounds, can't see player
            if (!ObjectManager.InsideBounds(pos))
                return false;

            //See if player is at position "pos"
            PlayerObj obj = ObjectManager.GetObjectOfTypeAt(pos, Type.player) as PlayerObj;
            //Maximum distance less one
            distance--;

            //If found player, return true
            if(obj != null) {
                return true;
            }
            //If there is more distance to check, check it
            else if (distance > 0)
            {
                return CheckForPlayer(side, pos + Sides.SideToVector(side), distance);
            }
            //No more distance to check, return false.
            else
            {
                return false;
            }
        }

    }
}
