using System; // require keep for Windows Universal App
using UnityEngine;
using UnityEngine.UI;
using Collider2D = UnityEngine.Collider2D;

namespace UniRx.Triggers
{
    // for GameObject
    public static partial class ObservableTriggerExtensions
    {
        #region ObservableAnimatorTrigger

        /// <summary>Callback for setting up animation IK (inverse kinematics).</summary>
        public static Subject<int> OnAnimatorIKAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<int>() as Subject<int>;
            return GetOrAddComponent<ObservableAnimatorTrigger>(gameObject).OnAnimatorIKAsObservable() as Subject<int>;
        }

        /// <summary>Callback for processing animation movements for modifying root motion.</summary>
        public static Subject<Unit> OnAnimatorMoveAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableAnimatorTrigger>(gameObject).OnAnimatorMoveAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableCollision2DTrigger

        /// <summary>Sent when an incoming collider makes contact with this object's collider (2D physics only).</summary>
        public static Subject<Collision2D> OnCollisionEnter2DAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collision2D>() as Subject<Collision2D>;
            return GetOrAddComponent<ObservableCollision2DTrigger>(gameObject).OnCollisionEnter2DAsObservable() as Subject<Collision2D>;
        }


        /// <summary>Sent when a collider on another object stops touching this object's collider (2D physics only).</summary>
        public static Subject<Collision2D> OnCollisionExit2DAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collision2D>() as Subject<Collision2D>;
            return GetOrAddComponent<ObservableCollision2DTrigger>(gameObject).OnCollisionExit2DAsObservable() as Subject<Collision2D>;
        }

        /// <summary>Sent each frame where a collider on another object is touching this object's collider (2D physics only).</summary>
        public static Subject<Collision2D> OnCollisionStay2DAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collision2D>() as Subject<Collision2D>;
            return GetOrAddComponent<ObservableCollision2DTrigger>(gameObject).OnCollisionStay2DAsObservable() as Subject<Collision2D>;
        }

        #endregion

        #region ObservableCollisionTrigger

        /// <summary>OnCollisionEnter is called when this collider/rigidbody has begun touching another rigidbody/collider.</summary>
        public static Subject<Collision> OnCollisionEnterAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collision>() as Subject<Collision>;
            return GetOrAddComponent<ObservableCollisionTrigger>(gameObject).OnCollisionEnterAsObservable() as Subject<Collision>;
        }


        /// <summary>OnCollisionExit is called when this collider/rigidbody has stopped touching another rigidbody/collider.</summary>
        public static Subject<Collision> OnCollisionExitAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collision>() as Subject<Collision>;
            return GetOrAddComponent<ObservableCollisionTrigger>(gameObject).OnCollisionExitAsObservable() as Subject<Collision>;
        }

        /// <summary>OnCollisionStay is called once per frame for every collider/rigidbody that is touching rigidbody/collider.</summary>
        public static Subject<Collision> OnCollisionStayAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collision>()  as Subject<Collision>;
            return GetOrAddComponent<ObservableCollisionTrigger>(gameObject).OnCollisionStayAsObservable()  as Subject<Collision>;
        }

        #endregion

        #region ObservableDestroyTrigger

        /// <summary>This function is called when the MonoBehaviour will be destroyed.</summary>
        public static Subject<Unit> OnDestroyAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Return(Unit.Default) as Subject<Unit>; // send destroy message
            return GetOrAddComponent<ObservableDestroyTrigger>(gameObject).OnDestroyAsObservable() as Subject<Unit>;
        }

        #endregion


        #region ObservableEnableTrigger

        /// <summary>This function is called when the object becomes enabled and active.</summary>
        public static Subject<Unit> OnEnableAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableEnableTrigger>(gameObject).OnEnableAsObservable() as Subject<Unit>;
        }

        /// <summary>This function is called when the behaviour becomes disabled () or inactive.</summary>
        public static Subject<Unit> OnDisableAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableEnableTrigger>(gameObject).OnDisableAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableFixedUpdateTrigger

        /// <summary>This function is called every fixed framerate frame, if the MonoBehaviour is enabled.</summary>
        public static Subject<Unit> FixedUpdateAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableFixedUpdateTrigger>(gameObject).FixedUpdateAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableLateUpdateTrigger

        /// <summary>LateUpdate is called every frame, if the Behaviour is enabled.</summary>
        public static Subject<Unit> LateUpdateAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableLateUpdateTrigger>(gameObject).LateUpdateAsObservable() as Subject<Unit>;
        }

        #endregion

#if !(UNITY_IPHONE || UNITY_ANDROID || UNITY_METRO)

        #region ObservableMouseTrigger

        /// <summary>OnMouseDown is called when the user has pressed the mouse button while over the GUIElement or Collider.</summary>
        public static Subject<Unit> OnMouseDownAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableMouseTrigger>(gameObject).OnMouseDownAsObservable() as Subject<Unit>;
        }

        /// <summary>OnMouseDrag is called when the user has clicked on a GUIElement or Collider and is still holding down the mouse.</summary>
        public static Subject<Unit> OnMouseDragAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableMouseTrigger>(gameObject).OnMouseDragAsObservable() as Subject<Unit>;
        }

        /// <summary>OnMouseEnter is called when the mouse entered the GUIElement or Collider.</summary>
        public static Subject<Unit> OnMouseEnterAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableMouseTrigger>(gameObject).OnMouseEnterAsObservable() as Subject<Unit>;
        }

        /// <summary>OnMouseExit is called when the mouse is not any longer over the GUIElement or Collider.</summary>
        public static Subject<Unit> OnMouseExitAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableMouseTrigger>(gameObject).OnMouseExitAsObservable() as Subject<Unit>;
        }

        /// <summary>OnMouseOver is called every frame while the mouse is over the GUIElement or Collider.</summary>
        public static Subject<Unit> OnMouseOverAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableMouseTrigger>(gameObject).OnMouseOverAsObservable() as Subject<Unit>;
        }

        /// <summary>OnMouseUp is called when the user has released the mouse button.</summary>
        public static Subject<Unit> OnMouseUpAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableMouseTrigger>(gameObject).OnMouseUpAsObservable() as Subject<Unit>;
        }

        /// <summary>OnMouseUpAsButton is only called when the mouse is released over the same GUIElement or Collider as it was pressed.</summary>
        public static Subject<Unit> OnMouseUpAsButtonAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableMouseTrigger>(gameObject).OnMouseUpAsButtonAsObservable() as Subject<Unit>;
        }

        #endregion

#endif

        #region ObservableTrigger2DTrigger

        /// <summary>Sent when another object enters a trigger collider attached to this object (2D physics only).</summary>
        public static Subject<Collider2D> OnTriggerEnter2DAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collider2D>() as Subject<Collider2D>;
            return GetOrAddComponent<ObservableTrigger2DTrigger>(gameObject).OnTriggerEnter2DAsObservable() as Subject<Collider2D>;
        }


        /// <summary>Sent when another object leaves a trigger collider attached to this object (2D physics only).</summary>
        public static Subject<Collider2D> OnTriggerExit2DAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collider2D>() as Subject<Collider2D>;
            return GetOrAddComponent<ObservableTrigger2DTrigger>(gameObject).OnTriggerExit2DAsObservable() as Subject<Collider2D>;
        }

        /// <summary>Sent each frame where another object is within a trigger collider attached to this object (2D physics only).</summary>
        public static Subject<Collider2D> OnTriggerStay2DAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collider2D>() as Subject<Collider2D>;
            return GetOrAddComponent<ObservableTrigger2DTrigger>(gameObject).OnTriggerStay2DAsObservable() as Subject<Collider2D>;
        }

        #endregion

        #region ObservableTriggerTrigger

        /// <summary>OnTriggerEnter is called when the Collider other enters the trigger.</summary>
        public static Subject<Collider> OnTriggerEnterAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collider>() as Subject<Collider>;
            return GetOrAddComponent<ObservableTriggerTrigger>(gameObject).OnTriggerEnterAsObservable() as Subject<Collider>;
        }


        /// <summary>OnTriggerExit is called when the Collider other has stopped touching the trigger.</summary>
        public static Subject<Collider> OnTriggerExitAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collider>() as Subject<Collider>;
            return GetOrAddComponent<ObservableTriggerTrigger>(gameObject).OnTriggerExitAsObservable() as Subject<Collider>;
        }

        /// <summary>OnTriggerStay is called once per frame for every Collider other that is touching the trigger.</summary>
        public static Subject<Collider> OnTriggerStayAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Collider>() as Subject<Collider>;
            return GetOrAddComponent<ObservableTriggerTrigger>(gameObject).OnTriggerStayAsObservable() as Subject<Collider>;
        }

        #endregion

        #region ObservableUpdateTrigger

        /// <summary>Update is called every frame, if the MonoBehaviour is enabled.</summary>
        public static Subject<Unit> UpdateAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableUpdateTrigger>(gameObject).UpdateAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableVisibleTrigger

        /// <summary>OnBecameInvisible is called when the renderer is no longer visible by any camera.</summary>
        public static Subject<Unit> OnBecameInvisibleAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableVisibleTrigger>(gameObject).OnBecameInvisibleAsObservable() as Subject<Unit>;
        }

        /// <summary>OnBecameVisible is called when the renderer became visible by any camera.</summary>
        public static Subject<Unit> OnBecameVisibleAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableVisibleTrigger>(gameObject).OnBecameVisibleAsObservable() as Subject<Unit>;
        }

        #endregion

#if !(UNITY_4_0 || UNITY_4_1 || UNITY_4_2 || UNITY_4_3 || UNITY_4_4 || UNITY_4_5)

        #region ObservableTransformChangedTrigger

        /// <summary>Callback sent to the graphic before a Transform parent change occurs.</summary>
        public static Subject<Unit> OnBeforeTransformParentChangedAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableTransformChangedTrigger>(gameObject).OnBeforeTransformParentChangedAsObservable() as Subject<Unit>;
        }

        /// <summary>This function is called when the parent property of the transform of the GameObject has changed.</summary>
        public static Subject<Unit> OnTransformParentChangedAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableTransformChangedTrigger>(gameObject).OnTransformParentChangedAsObservable() as Subject<Unit>;
        }

        /// <summary>This function is called when the list of children of the transform of the GameObject has changed.</summary>
        public static Subject<Unit> OnTransformChildrenChangedAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableTransformChangedTrigger>(gameObject).OnTransformChildrenChangedAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableCanvasGroupChangedTrigger

        /// <summary>Callback that is sent if the canvas group is changed.</summary>
        public static Subject<Unit> OnCanvasGroupChangedAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableCanvasGroupChangedTrigger>(gameObject).OnCanvasGroupChangedAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableRectTransformTrigger

        /// <summary>Callback that is sent if an associated RectTransform has it's dimensions changed.</summary>
        public static Subject<Unit> OnRectTransformDimensionsChangeAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableRectTransformTrigger>(gameObject).OnRectTransformDimensionsChangeAsObservable() as Subject<Unit>;
        }

        /// <summary>Callback that is sent if an associated RectTransform is removed.</summary>
        public static Subject<Unit> OnRectTransformRemovedAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableRectTransformTrigger>(gameObject).OnRectTransformRemovedAsObservable() as Subject<Unit>;
        }

        #endregion
#endif

        #region ObservableParticleTrigger

        /// <summary>OnParticleCollision is called when a particle hits a collider.</summary>
        public static Subject<GameObject> OnParticleCollisionAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<GameObject>() as Subject<GameObject>;
            return GetOrAddComponent<ObservableParticleTrigger>(gameObject).OnParticleCollisionAsObservable() as Subject<GameObject>;
        }

#if UNITY_5_4_OR_NEWER

        /// <summary>OnParticleTrigger is called when any particles in a particle system meet the conditions in the trigger module.</summary>
        public static Subject<Unit> OnParticleTriggerAsObservable(this GameObject gameObject)
        {
            if (gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableParticleTrigger>(gameObject).OnParticleTriggerAsObservable() as Subject<Unit>;
        }

#endif

        #endregion


        static T GetOrAddComponent<T>(GameObject gameObject)
            where T : Component
        {
            var component = gameObject.GetComponent<T>();
            if (component == null)
            {
                component = gameObject.AddComponent<T>();
            }

            return component;
        }
    }
}
