using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Dungeon
{
    /**
 * All the game objects that will share the game grid need to have this script.
 * It manage the position of the object in the grid between other stuff.
 */
    public class BaseObj : MonoBehaviour {

        //Types of object inside the game
        //Can add more as needed
        public enum Type
        {
            player,
            enemy,
            interactive,
            wall
        }
        //Chance to this item to spawn, maybe you want a NPC only have 50% to spawn
        [Range(0, 1f)]
        public float chanceTospawn = 1f;
        //Type of the object
        public Type ObjType;

        //Graphical representation of the object, a sprite or 3D model
        public GameObject graphics;
        //Keep the position of the graphic object before any animation, like jump or attack
        protected Vector3 graphicsInitPos;

        protected Coroutine moveAnimation;


        public virtual void Start()
        { 
            //Check if the object can spawn, else destroy it
            if(Random.Range(0, 1f) > chanceTospawn)
            {
                Destroy(gameObject);
                return;
            }
            //Get the Grid position of the item
            IntVector2 pos = Position();

            //Register the position of this object in the ObjectManager
            ObjectManager.SetObjectsAt(pos.x, pos.z, this);

            //Set the initial position of graphics (local)
            if(graphics != null)
                graphicsInitPos = graphics.transform.localPosition;
        }




        //Check if there is a wall between this object and the player
        public bool WallInPathToPlayer()
        {
            //Get wall layer
            int wallLayer = LayerMask.NameToLayer("Wall");
            //Make a layerMask using the wall Layer
            LayerMask wallMask = 1 << wallLayer;
            //Check if there is any hit to the layerMask between this and player
            return Physics.Raycast(transform.position, (PlayerObj.playerInstance.transform.position - transform.position).normalized, Vector3.Distance(transform.position, PlayerObj.playerInstance.transform.position), wallMask);
        }

        //Return the distance between this and another OBJ
        public int DistanceFromObject(BaseObj obj)
        {
            if (obj == null)
                return 999;

            IntVector2 position = Position();
            IntVector2 playerPos = PlayerObj.playerInstance.Position();

            return Mathf.CeilToInt(Vector2.Distance(new Vector2(position.x, position.z), new Vector2(playerPos.x, playerPos.z)));


        }

        //Choose a direction to go to reach the obj
        public Sides.sideChoices DirectionToObj(BaseObj obj)
        {

            if (obj == null)
                return Sides.sideChoices.none;

            IntVector2 position = Position();
            IntVector2 dir = position - PlayerObj.playerInstance.Position();

       
            //There will be two options to move, if can't go to opt1, will go to opt2
            Sides.sideChoices opt1;
            Sides.sideChoices opt2;

            //If the direction X is closer than Z, choose left or right for the first option, and up or down for the second option
            if (Mathf.Abs(dir.x) > Mathf.Abs(dir.z))
            {
                if (dir.x < 0 )
                    opt1 = Sides.sideChoices.right;
                else
                    opt1 = Sides.sideChoices.left;

                if (dir.z < 0)
                    opt2 = Sides.sideChoices.up;
                else
                    opt2 = Sides.sideChoices.down;
            }
            //Else, do the oposite
            else
            {
                if (dir.z < 0)
                    opt1 = Sides.sideChoices.up;
                else
                    opt1 = Sides.sideChoices.down;

                if (dir.x < 0)
                    opt2 = Sides.sideChoices.right;
                else
                    opt2 = Sides.sideChoices.left;
            }
            //If there is a obstacle for opt1, go to opt2.
            //If there is a obstacle of opt2, the Move Func will not let him move, so he will stay in the same place;
            if (!ObjectManager.CheckObstacle(position + Sides.SideToVector(opt1)))
                return opt1;
            else
                return opt2;

        }
        //Position in the game Grid
        public IntVector2 Position()
        {
            //Position on the game grid will be the Unity position, but rounded to the nearest Int
            return new IntVector2(Mathf.RoundToInt(transform.position.x), Mathf.RoundToInt(transform.position.z));
        }

        //Attack a killable damage using this obj
        public virtual void AttackObj(KillableObj obj, float damage)
        {
            //Send the damage to the obj
            obj.Damage(damage);

            //Stor the last attack animation if is occurring
            if(attAnimation != null)
                StopCoroutine(attAnimation);
            //Start attack animation
            attAnimation = StartCoroutine(AttackAnimation((obj.transform.position - transform.position).normalized ));

        
        }

        protected Coroutine attAnimation;

        //Attack animation
        public IEnumerator AttackAnimation(Vector3 side)
        {
            float animTime = 0.2f ;
            float currTime = 0;

            //Create a animation curve for the attack
            AnimationCurve curve = new AnimationCurve(new Keyframe(0, 0, 0, 0f), new Keyframe(0.5f, 0.25f, -1f, -1f), new Keyframe(1, 0, 0, 0));

            //Transform the graphics position to do the animation
            while(currTime <= animTime)
            {
                float force = curve.Evaluate(currTime / animTime);
                graphics.transform.localPosition = graphicsInitPos + (side  * force);
                currTime += Time.deltaTime;
                yield return null;
            }

            graphics.transform.localPosition = graphicsInitPos;

        }

        //Update the object position on grid (Ex: Obj Moved)
        public void UpdatePosition(IntVector2 newPos)
        {

            IntVector2 pos = Position();
            //Update the position of the object in ObjectManager
            ObjectManager.UpdateObjectsAt(pos.x, pos.z, newPos.x, newPos.z, this);

            if (moveAnimation != null)
                StopCoroutine(moveAnimation);

            //Get the current pos
            Vector3 lastPos = transform.position;
            //Update the pos
            transform.position = new Vector3(newPos.x, transform.position.y, newPos.z);
            //Start the movement animation
            moveAnimation = StartCoroutine(MoveAnimation(graphics.transform, lastPos, new Vector3(newPos.x, transform.position.y, newPos.z), 0.10f));

        }

        //Animate the position between two points of a transform
        public virtual IEnumerator MoveAnimation(Transform obj, Vector3 from, Vector3 to, float time)
        {
            //Timer to finish the animation
            float timer = 0;

            //While timer is less or equal to time, do animation
            while(timer <= time)
            {
                //Calculate new position
                obj.transform.position = Vector3.Lerp(from, to, timer / time);
                timer += Time.deltaTime;
                yield return null;
            }
            //Fix the object in the right position on the animation end.
            obj.transform.position = to;

        }

        //Move the OBJ
        public virtual void Move(Sides.sideChoices side)
        {
            IntVector2 newPos = Position() + Sides.SideToVector(side);

            //If there is an obstracle in the next position, don't move the object.
            if (!ObjectManager.CheckObstacle(newPos.x, newPos.z)){
                UpdatePosition(newPos);
            }
        }

        //Get a list of objects on position XZ
        public List<BaseObj> HitObj(int posX, int posZ)
        {
            return ObjectManager.GetObjectsAt(posX, posZ);
        }

        //Once this object is destroyed
        public virtual void OnDestroy()
        {
            //Once the object is destroyed, remove it from the ObjectManager
            IntVector2 pos = Position();
            ObjectManager.RemoveObjectsAt(pos.x, pos.z, this);

        }

        //Actions that the object will do on his in game turn (usually after the player move or attack)
        public virtual void OnStep()
        {
        
        }

        //Call the OnStep on all the BaseObj in the game
        public static void UpdateStep()
        {
            BaseObj[] objs = GameObject.FindObjectsOfType<BaseObj>();

            //Fist update the enemies, they can move and attack.
            for(int i = 0; i < objs.Length; i++)
            {
                if(objs[i].ObjType == Type.enemy)
                    objs[i].OnStep();
            }

            //After that update traps that enemies may have triggered, and any other stuffs.
            for (int i = 0; i < objs.Length; i++)
            {
                if (objs[i].ObjType != Type.enemy)
                    objs[i].OnStep();
            }
        }

    }
}
