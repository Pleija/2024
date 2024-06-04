using UnityEngine;

/*
 * Enemy that use projectiles to attack
 */

namespace Dungeon
{
    public class EnemyRangedObj : EnemyObj {
        //Projectile that will create to attack
        public ProjectileBase AttackInstance;

        //Override the attack function
        public override void AttackObj(KillableObj obj, float damage)
        {
            //Default, play a arrow show
            npcAudio.PlayArrowShot();
            //Create the projectile
            ProjectileBase projectile = Instantiate<ProjectileBase>(AttackInstance, transform.position, Quaternion.identity, transform);

            //Configure the projectile
            projectile.parent = this;
            projectile.target = PlayerObj.playerInstance.gameObject;
            projectile.damage = status.CalculateAttack();
        }

    
    }
}
