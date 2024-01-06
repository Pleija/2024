using UnityEngine;
using UnityEngine.UI;

/*
 * Manage the UI elements for the game
 */
namespace Dungeon
{
    public class UIManager : MonoBehaviour {

   

        //Main canvas that will manage
        public Canvas canvas;
        //Prefab that will be used for elements that need a bar (Like KillableObjects health bar)
        public Image ProgressBar;
        //Prefab that will be used for elements that need a bar background (Like KillableObjects health bar)
        public Image ProgressBarBackground;
        //Prefab for the Damage box (like wen a enemy is hit, it create a box showing the damage using this prefab)
        public DamageText damageBox;

        //Instance for this script
        public static UIManager instance {
            get
            {
                if (_instance == null)
                    _instance = FindObjectOfType<UIManager>();
                return _instance;
            }
        }
        private static UIManager _instance;

        void Awake()
        {
            _instance = this;
        }

        //Create a new element inside the canvas
        public static GameObject InstatianteInCanvas(GameObject instance)
        {
            GameObject obj = Instantiate(instance);
            obj.transform.SetParent(UIManager.instance.canvas.transform);
            return obj;
        }

        //Transform a world space position to the canvas position
        public static Vector2 WorldSpace2Canvas(Vector3 pos)
        {
            if (Camera.main == null)
                return Vector2.zero;

            RectTransform CanvasRect = instance.canvas.GetComponent<RectTransform>();

            Vector2 viewPos = Camera.main.WorldToViewportPoint(pos);
            Vector2 screenPos = new Vector2(
                ((viewPos.x * CanvasRect.sizeDelta.x) - (CanvasRect.sizeDelta.x * 0.5f)),
                ((viewPos.y * CanvasRect.sizeDelta.y) - (CanvasRect.sizeDelta.y * 0.5f)));

            return screenPos;
        }
    }
}
