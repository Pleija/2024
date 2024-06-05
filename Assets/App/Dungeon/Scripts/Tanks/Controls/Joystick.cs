using UnityEngine;
using UnityEngine.EventSystems;

//Touch Joystick copmonent for uGUI
namespace TankShooter
{
    [RequireComponent(typeof(RectTransform))]
    public class Joystick : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        public RectTransform thumb;                               //object with thumb image
        public Vector2 autoReturnSpeed = new Vector2(4.0f, 4.0f); //speed of thumb return
        public float radius = 40.0f;                              //radius to move thumb within
        public bool isMoving = false;                             //check is joystick moving now
        public bool isReturned = true;                            //check if thumb returned to default position
        private float minOffset = 0.1f;                           //minimum offset from center to start action
        public RectTransform _canvas;                             //canvas that contains this joystick
        int pointerID = -1;                                       //id number of touch
	
        public Vector2 offset { //returns current offset of joystick
            get {
                if (thumb.anchoredPosition.magnitude < radius)
                    return thumb.anchoredPosition / radius;
                return thumb.anchoredPosition.normalized;
            }
        }

        //action on start joystick touch
        void IPointerDownHandler.OnPointerDown(PointerEventData eventData) {
            if (!isMoving) //if no pressed save the first pointer id
                pointerID = eventData.pointerId;
            else 
                return;
            isMoving = true;
            isReturned = false;
            var handleOffset = GetJoystickOffset(eventData); //get offset pos
            thumb.anchoredPosition = handleOffset;           //change thumb image pos
        }

        //action on move/drag joystick 
        void IDragHandler.OnDrag(PointerEventData eventData) {
            if (pointerID != eventData.pointerId) //if it's not first touch - ignore it
                return;
            var handleOffset = GetJoystickOffset(eventData); //get offset pos
            thumb.anchoredPosition = handleOffset;           //change thumb image pos
        }

        //action on release joystick 
        void IPointerUpHandler.OnPointerUp(PointerEventData eventData) {
            if (pointerID != eventData.pointerId)
                return;
            isMoving = false; //mark that joystick not move
        }

        //returns joystick offset form center pos
        private Vector2 GetJoystickOffset(PointerEventData eventData)
        {
            Vector3 globalHandle;
            if (RectTransformUtility.ScreenPointToWorldPointInRectangle(_canvas, eventData.position, eventData.pressEventCamera, out globalHandle))
                thumb.position = globalHandle;
            var handleOffset = thumb.anchoredPosition;
            if (handleOffset.magnitude > radius)
            {
                handleOffset = handleOffset.normalized * radius;
                thumb.anchoredPosition = handleOffset;
            }
            return handleOffset;
        }
	
        void Start() {
            var touchZone = GetComponent<RectTransform>();
            touchZone.pivot = Vector2.one * 0.5f;
            thumb.transform.SetParent(transform); //move thumb image to foreground layer
        }
	
        void Update() {
            if (Vector2.Distance(thumb.anchoredPosition, Vector2.zero) < 0.05f)
                isReturned = true;
            if (!isMoving && !isReturned) //if joystick released - return thumb to center
                thumb.anchoredPosition -= new Vector2(thumb.anchoredPosition.x * autoReturnSpeed.x, thumb.anchoredPosition.y * autoReturnSpeed.y) * Time.deltaTime;
        }
    }
}
