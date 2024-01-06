using System.Collections;
using UnityEngine;

namespace Dungeon
{
    /**
 * All enemies of the game should use this call or a class that extend it.
 */

    public class EnemyObj : KillableObj
    {
        //How far can find the player
        public int distanceToSeePlayer = 5;
        //How close it need to be to attack
        public int distanceToAttack = 1;

        //Audios that this NPC will play
        public NPCAudioManager npcAudio;

        public override void Start()
        {
            base.Start();
        
            //StartCoroutine(MovementTest());
        }
        //Keep moving the NPC, for debugging
        public IEnumerator MovementTest()
        {
            Move(Sides.sideChoices.up);
            yield return new WaitForSeconds(1f);
            StartCoroutine(MovementTest());
        }
        //Can it see the player?
        public bool CanSeePlayer()
        {
            return DistanceFromObject(PlayerObj.playerInstance) <= distanceToSeePlayer /*&& !WallInPathToPlayer()*/;

        }
        //Closer direction to get to player
        public Sides.sideChoices DirectionToPlayer()
        {
            return DirectionToObj(PlayerObj.playerInstance);
        }
        //Can it attack the player?
        public bool CanAttackPlayer()
        {
            return DistanceFromObject(PlayerObj.playerInstance) <= distanceToAttack;
        }
        //Attack the player
        public void AttackPlayer()
        {
            AttackObj(PlayerObj.playerInstance, status.CalculateAttack());
        }

        //Move or attack the player
        public void Movement()
        {
            if (CanAttackPlayer())
            {
                //Debug.Log("Atacking Player");
                AttackPlayer();
            }
            else if (CanSeePlayer())
            {
                Move(DirectionToPlayer());
            }
            else
                Move(Sides.RandomSide());
        }

        //Move the enemy
        public override void Move(Sides.sideChoices side)
        {
            base.Move(side);

            InteractiveObj item = ObjectManager.GetInteractive(Position());


            //If there is a interactive on the ground, call its EnemyGet Function
            if (item != null)
            {
                item.EnemyGet();
            }
        }

        void Reset()
        {
            ObjType = Type.enemy;
        }

        //Called on his turn
        public override void OnStep()
        {

            base.OnStep();
            //For each action it have, do a action
            while (numberActions >= 1)
            {
                Movement();
                numberActions--;
            }
        }


    }
}
