using UnityEngine;
using UnityEngine.UI;

//component for Lifebar object
namespace TankShooter
{
    public class LifeBar : MonoBehaviour {

        public Image[] lifeImages; //images of lifes (i.e.heart)

        //hide life image when player hurts
        public void HideLife(int restLifes) {
            if (restLifes < 0)
                return;
            for (int i = lifeImages.Length-1; i >= restLifes; i--)
                if (lifeImages[i] != null)
                    lifeImages[i].enabled = false;
        }
    }
}
