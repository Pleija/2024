using System.Collections;
using UnityEngine;
using UnityEngine.UI;

/*
 * Make appear a floating text box showing how much damage was done
 */

namespace Dungeon
{
    public class DamageText : MonoBehaviour {

        //Color of the text
        protected Color color;
        //TextBox to show the damage
        public Text textBox;

        //AnimationCurve of the floating textbox
        public AnimationCurve curve;
        //Animation speed
        public float animationTime = 1f;

        //Create the box in the right position
        public void CreateBox(int value)
        {
            //textBox.color = color;
            textBox.text = value.ToString();
            textBox.GetComponent<RectTransform>().anchoredPosition = UIManager.WorldSpace2Canvas(transform.position);
            color = textBox.color;

            StartCoroutine(StartAnimation());
        }

        //Make the floating animation for the TextBox
        public IEnumerator StartAnimation()
        {
        
            float currTime = 0;

            while (currTime < animationTime)
            {
                float value = 1 - curve.Evaluate(currTime / animationTime);
                textBox.transform.Translate(Vector3.up * value);
                color.a = curve.Evaluate(1 - (currTime / animationTime));
                textBox.color = color;

                currTime += Time.deltaTime;
                yield return null ;
            }


            //Destroy game object once its finished
            Destroy(gameObject);
        }
    }
}
