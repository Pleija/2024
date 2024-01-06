using UnityEngine;

/*
 * All projectiles should extend this
 */

namespace Dungeon
{
	public class ProjectileBase : MonoBehaviour {

		//Projectile parent (monster, trap)
		[HideInInspector]
		public BaseObj parent;
		//Target to hit
		[HideInInspector]
		public GameObject target;

		//Damage to do
		public float damage;

		public virtual void Start () {
			//Start a action on created
			ObjectManager.StartAction();
		}
	
		public virtual void Update () {
		
		}

		public virtual void OnDestroy()
		{
			//End this action once is destroyed
			ObjectManager.EndAction();
		}


		public IntVector2 Position()
		{
			//Position on the game grid will be the Unity position, but rounded to the nearest Int
			return new IntVector2(Mathf.RoundToInt(transform.position.x), Mathf.RoundToInt(transform.position.z));
		}
	}
}
