using UnityEngine;

namespace Dungeon
{
	/**
 * Change the position of an object by each curve.
 */
	public class AnimatePosition : MonoBehaviour {
		//Curves to animate the translation
		public AnimationCurve curveX;
		public AnimationCurve curveY;
		public AnimationCurve curveZ;

		//Speed of the animation
		public float animationSpeed = 0.1f;

		//Total time since the creation of the script
		public float currTime;
	
	
		void Update () {
			//Calculate each force for each axis
			float forceX = curveX.Evaluate(currTime) * animationSpeed;
			float forceY = curveY.Evaluate(currTime) * animationSpeed;
			float forceZ = curveZ.Evaluate(currTime) * animationSpeed;

			//Translate in each axis
			transform.Translate(new Vector3(forceX, forceY, forceZ));

			//Add the time multiplied by the speed of the animation
			currTime += Time.deltaTime * animationSpeed;
        
		}
	}
}
