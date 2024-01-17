﻿using System; // require keep for Windows Universal App
using UnityEngine;

#if !(UNITY_4_0 || UNITY_4_1 || UNITY_4_2 || UNITY_4_3 || UNITY_4_4 || UNITY_4_5)
using UnityEngine.EventSystems;
#endif

namespace UniRx.Triggers
{
    // for Component
    public static partial class ObservableTriggerExtensions
    {
        #region ObservableAnimatorTrigger

        /// <summary>Callback for setting up animation IK (inverse kinematics).</summary>
        public static Subject<int> OnAnimatorIKAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<int>() as Subject<int>;
            return GetOrAddComponent<ObservableAnimatorTrigger>(component.gameObject).OnAnimatorIKAsObservable() as Subject<int>;
        }

        /// <summary>Callback for processing animation movements for modifying root motion.</summary>
        public static Subject<Unit> OnAnimatorMoveAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableAnimatorTrigger>(component.gameObject).OnAnimatorMoveAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableCollision2DTrigger

        /// <summary>Sent when an incoming collider makes contact with this object's collider (2D physics only).</summary>
        public static Subject<Collision2D> OnCollisionEnter2DAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collision2D>() as Subject<Collision2D>;
            return GetOrAddComponent<ObservableCollision2DTrigger>(component.gameObject).OnCollisionEnter2DAsObservable() as Subject<Collision2D>;;
        }


        /// <summary>Sent when a collider on another object stops touching this object's collider (2D physics only).</summary>
        public static Subject<Collision2D> OnCollisionExit2DAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collision2D>() as Subject<Collision2D>;;
            return GetOrAddComponent<ObservableCollision2DTrigger>(component.gameObject).OnCollisionExit2DAsObservable() as Subject<Collision2D>;;
        }

        /// <summary>Sent each frame where a collider on another object is touching this object's collider (2D physics only).</summary>
        public static Subject<Collision2D> OnCollisionStay2DAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collision2D>() as Subject<Collision2D>;;
            return GetOrAddComponent<ObservableCollision2DTrigger>(component.gameObject).OnCollisionStay2DAsObservable() as Subject<Collision2D>;;
        }

        #endregion

        #region ObservableCollisionTrigger

        /// <summary>OnCollisionEnter is called when this collider/rigidbody has begun touching another rigidbody/collider.</summary>
        public static Subject<Collision> OnCollisionEnterAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collision>() as Subject<Collision>;
            return GetOrAddComponent<ObservableCollisionTrigger>(component.gameObject).OnCollisionEnterAsObservable() as Subject<Collision>;
        }


        /// <summary>OnCollisionExit is called when this collider/rigidbody has stopped touching another rigidbody/collider.</summary>
        public static Subject<Collision> OnCollisionExitAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collision>() as Subject<Collision>;
            return GetOrAddComponent<ObservableCollisionTrigger>(component.gameObject).OnCollisionExitAsObservable() as Subject<Collision>;
        }

        /// <summary>OnCollisionStay is called once per frame for every collider/rigidbody that is touching rigidbody/collider.</summary>
        public static Subject<Collision> OnCollisionStayAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collision>() as Subject<Collision>;
            return GetOrAddComponent<ObservableCollisionTrigger>(component.gameObject).OnCollisionStayAsObservable() as Subject<Collision>;
        }

        #endregion

        #region ObservableDestroyTrigger

        /// <summary>This function is called when the MonoBehaviour will be destroyed.</summary>
        public static Subject<Unit> OnDestroyAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Return(Unit.Default) as Subject<Unit>; // send destroy message
            return GetOrAddComponent<ObservableDestroyTrigger>(component.gameObject).OnDestroyAsObservable() as Subject<Unit>;
        }

        #endregion


        #region ObservableEnableTrigger

        /// <summary>This function is called when the object becomes enabled and active.</summary>
        public static Subject<Unit> OnEnableAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableEnableTrigger>(component.gameObject).OnEnableAsObservable() as Subject<Unit>;
        }

        /// <summary>This function is called when the behaviour becomes disabled () or inactive.</summary>
        public static Subject<Unit> OnDisableAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableEnableTrigger>(component.gameObject).OnDisableAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableFixedUpdateTrigger

        /// <summary>This function is called every fixed framerate frame, if the MonoBehaviour is enabled.</summary>
        public static Subject<Unit> FixedUpdateAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableFixedUpdateTrigger>(component.gameObject).FixedUpdateAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableLateUpdateTrigger

        /// <summary>LateUpdate is called every frame, if the Behaviour is enabled.</summary>
        public static Subject<Unit> LateUpdateAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableLateUpdateTrigger>(component.gameObject).LateUpdateAsObservable() as Subject<Unit>;
        }

        #endregion

#if !(UNITY_IPHONE || UNITY_ANDROID || UNITY_METRO)

        #region ObservableMouseTrigger

        /// <summary>OnMouseDown is called when the user has pressed the mouse button while over the GUIElement or Collider.</summary>
        public static Subject<Unit> OnMouseDownAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>();
            return GetOrAddComponent<ObservableMouseTrigger>(component.gameObject).OnMouseDownAsObservable();
        }

        /// <summary>OnMouseDrag is called when the user has clicked on a GUIElement or Collider and is still holding down the mouse.</summary>
        public static Subject<Unit> OnMouseDragAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>();
            return GetOrAddComponent<ObservableMouseTrigger>(component.gameObject).OnMouseDragAsObservable();
        }

        /// <summary>OnMouseEnter is called when the mouse entered the GUIElement or Collider.</summary>
        public static Subject<Unit> OnMouseEnterAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>();
            return GetOrAddComponent<ObservableMouseTrigger>(component.gameObject).OnMouseEnterAsObservable();
        }

        /// <summary>OnMouseExit is called when the mouse is not any longer over the GUIElement or Collider.</summary>
        public static Subject<Unit> OnMouseExitAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>();
            return GetOrAddComponent<ObservableMouseTrigger>(component.gameObject).OnMouseExitAsObservable();
        }

        /// <summary>OnMouseOver is called every frame while the mouse is over the GUIElement or Collider.</summary>
        public static Subject<Unit> OnMouseOverAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>();
            return GetOrAddComponent<ObservableMouseTrigger>(component.gameObject).OnMouseOverAsObservable();
        }

        /// <summary>OnMouseUp is called when the user has released the mouse button.</summary>
        public static Subject<Unit> OnMouseUpAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>();
            return GetOrAddComponent<ObservableMouseTrigger>(component.gameObject).OnMouseUpAsObservable();
        }

        /// <summary>OnMouseUpAsButton is only called when the mouse is released over the same GUIElement or Collider as it was pressed.</summary>
        public static Subject<Unit> OnMouseUpAsButtonAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>();
            return GetOrAddComponent<ObservableMouseTrigger>(component.gameObject).OnMouseUpAsButtonAsObservable();
        }

        #endregion

#endif

        #region ObservableTrigger2DTrigger

        /// <summary>Sent when another object enters a trigger collider attached to this object (2D physics only).</summary>
        public static Subject<Collider2D> OnTriggerEnter2DAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collider2D>() as Subject<Collider2D>;
            return GetOrAddComponent<ObservableTrigger2DTrigger>(component.gameObject).OnTriggerEnter2DAsObservable() as Subject<Collider2D>;
        }


        /// <summary>Sent when another object leaves a trigger collider attached to this object (2D physics only).</summary>
        public static Subject<Collider2D> OnTriggerExit2DAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collider2D>() as Subject<Collider2D>;
            return GetOrAddComponent<ObservableTrigger2DTrigger>(component.gameObject).OnTriggerExit2DAsObservable() as Subject<Collider2D>;
        }

        /// <summary>Sent each frame where another object is within a trigger collider attached to this object (2D physics only).</summary>
        public static Subject<Collider2D> OnTriggerStay2DAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collider2D>() as Subject<Collider2D>;
            return GetOrAddComponent<ObservableTrigger2DTrigger>(component.gameObject).OnTriggerStay2DAsObservable() as Subject<Collider2D>;
        }

        #endregion

        #region ObservableTriggerTrigger

        /// <summary>OnTriggerEnter is called when the Collider other enters the trigger.</summary>
        public static Subject<Collider> OnTriggerEnterAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collider>() as Subject<Collider>;
            return GetOrAddComponent<ObservableTriggerTrigger>(component.gameObject).OnTriggerEnterAsObservable() as Subject<Collider>;
        }


        /// <summary>OnTriggerExit is called when the Collider other has stopped touching the trigger.</summary>
        public static Subject<Collider> OnTriggerExitAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collider>() as Subject<Collider>;
            return GetOrAddComponent<ObservableTriggerTrigger>(component.gameObject).OnTriggerExitAsObservable() as
                Subject<Collider>;
        }

        /// <summary>OnTriggerStay is called once per frame for every Collider other that is touching the trigger.</summary>
        public static Subject<Collider> OnTriggerStayAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Collider>() as Subject<Collider>;
            return GetOrAddComponent<ObservableTriggerTrigger>(component.gameObject).OnTriggerStayAsObservable() as Subject<Collider>;
        }

        #endregion

        #region ObservableUpdateTrigger

        /// <summary>Update is called every frame, if the MonoBehaviour is enabled.</summary>
        public static Subject<Unit> UpdateAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableUpdateTrigger>(component.gameObject).UpdateAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableVisibleTrigger

        /// <summary>OnBecameInvisible is called when the renderer is no longer visible by any camera.</summary>
        public static Subject<Unit> OnBecameInvisibleAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableVisibleTrigger>(component.gameObject).OnBecameInvisibleAsObservable() as Subject<Unit>;
        }

        /// <summary>OnBecameVisible is called when the renderer became visible by any camera.</summary>
        public static Subject<Unit> OnBecameVisibleAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableVisibleTrigger>(component.gameObject).OnBecameVisibleAsObservable() as Subject<Unit>;
        }

        #endregion

#if !(UNITY_4_0 || UNITY_4_1 || UNITY_4_2 || UNITY_4_3 || UNITY_4_4 || UNITY_4_5)

        #region ObservableTransformChangedTrigger

        /// <summary>Callback sent to the graphic before a Transform parent change occurs.</summary>
        public static Subject<Unit> OnBeforeTransformParentChangedAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableTransformChangedTrigger>(component.gameObject).OnBeforeTransformParentChangedAsObservable() as Subject<Unit>;
        }

        /// <summary>This function is called when the parent property of the transform of the GameObject has changed.</summary>
        public static Subject<Unit> OnTransformParentChangedAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableTransformChangedTrigger>(component.gameObject).OnTransformParentChangedAsObservable() as Subject<Unit>;
        }

        /// <summary>This function is called when the list of children of the transform of the GameObject has changed.</summary>
        public static Subject<Unit> OnTransformChildrenChangedAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableTransformChangedTrigger>(component.gameObject).OnTransformChildrenChangedAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableCanvasGroupChangedTrigger

        /// <summary>Callback that is sent if the canvas group is changed.</summary>
        public static Subject<Unit> OnCanvasGroupChangedAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableCanvasGroupChangedTrigger>(component.gameObject).OnCanvasGroupChangedAsObservable() as Subject<Unit>;
        }

        #endregion

        #region ObservableRectTransformTrigger

        /// <summary>Callback that is sent if an associated RectTransform has it's dimensions changed.</summary>
        public static Subject<Unit> OnRectTransformDimensionsChangeAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableRectTransformTrigger>(component.gameObject).OnRectTransformDimensionsChangeAsObservable() as Subject<Unit>;
        }

        /// <summary>Callback that is sent if an associated RectTransform is removed.</summary>
        public static Subject<Unit> OnRectTransformRemovedAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableRectTransformTrigger>(component.gameObject).OnRectTransformRemovedAsObservable() as Subject<Unit>;
        }

        #endregion

        // uGUI

        #region ObservableEventTrigger classes

        public static Subject<BaseEventData> OnDeselectAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<BaseEventData>() as Subject<BaseEventData>;
            return GetOrAddComponent<ObservableDeselectTrigger>(component.gameObject).OnDeselectAsObservable() as Subject<BaseEventData>;
        }

        public static Subject<AxisEventData> OnMoveAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<AxisEventData>() as Subject<AxisEventData>;
            return GetOrAddComponent<ObservableMoveTrigger>(component.gameObject).OnMoveAsObservable() as Subject<AxisEventData>;
        }

        public static Subject<PointerEventData> OnPointerDownAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservablePointerDownTrigger>(component.gameObject).OnPointerDownAsObservable() as Subject<PointerEventData>;
        }

        public static Subject<PointerEventData> OnPointerEnterAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservablePointerEnterTrigger>(component.gameObject).OnPointerEnterAsObservable() as Subject<PointerEventData>;
        }

        public static Subject<PointerEventData> OnPointerExitAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservablePointerExitTrigger>(component.gameObject).OnPointerExitAsObservable() as Subject<PointerEventData>;
        }

        public static Subject<PointerEventData> OnPointerUpAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservablePointerUpTrigger>(component.gameObject).OnPointerUpAsObservable() as Subject<PointerEventData>;
        }

        public static Subject<BaseEventData> OnSelectAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<BaseEventData>() as Subject<BaseEventData>;
            return GetOrAddComponent<ObservableSelectTrigger>(component.gameObject).OnSelectAsObservable() as Subject<BaseEventData>;
        }

        public static Subject<PointerEventData> OnPointerClickAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservablePointerClickTrigger>(component.gameObject).OnPointerClickAsObservable() as Subject<PointerEventData>;
        }

        public static Subject<BaseEventData> OnSubmitAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<BaseEventData>() as Subject<BaseEventData>;
            return GetOrAddComponent<ObservableSubmitTrigger>(component.gameObject).OnSubmitAsObservable() as Subject<BaseEventData>;
        }

        public static Subject<PointerEventData> OnDragAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservableDragTrigger>(component.gameObject).OnDragAsObservable() as Subject<PointerEventData>;
        }

        public static Subject<PointerEventData> OnBeginDragAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservableBeginDragTrigger>(component.gameObject).OnBeginDragAsObservable() as Subject<PointerEventData>;
        }

        public static Subject<PointerEventData> OnEndDragAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservableEndDragTrigger>(component.gameObject).OnEndDragAsObservable() as Subject<PointerEventData>;
        }

        public static Subject<PointerEventData> OnDropAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservableDropTrigger>(component.gameObject).OnDropAsObservable() as Subject<PointerEventData>;
        }

        public static Subject<BaseEventData> OnUpdateSelectedAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<BaseEventData>() as Subject<BaseEventData>;
            return GetOrAddComponent<ObservableUpdateSelectedTrigger>(component.gameObject).OnUpdateSelectedAsObservable() as Subject<BaseEventData>;
        }

        public static Subject<PointerEventData> OnInitializePotentialDragAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservableInitializePotentialDragTrigger>(component.gameObject).OnInitializePotentialDragAsObservable() as Subject<PointerEventData>;
        }

        public static Subject<BaseEventData> OnCancelAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<BaseEventData>() as Subject<BaseEventData>;
            return GetOrAddComponent<ObservableCancelTrigger>(component.gameObject).OnCancelAsObservable() as Subject<BaseEventData>;
        }

        public static Subject<PointerEventData> OnScrollAsObservable(this UIBehaviour component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<PointerEventData>() as Subject<PointerEventData>;
            return GetOrAddComponent<ObservableScrollTrigger>(component.gameObject).OnScrollAsObservable() as Subject<PointerEventData>;
        }

        #endregion

#endif

        #region ObservableParticleTrigger

        /// <summary>OnParticleCollision is called when a particle hits a collider.</summary>
        public static Subject<GameObject> OnParticleCollisionAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<GameObject>() as Subject<GameObject>;
            return GetOrAddComponent<ObservableParticleTrigger>(component.gameObject).OnParticleCollisionAsObservable() as Subject<GameObject>;
        }

#if UNITY_5_4_OR_NEWER

        /// <summary>OnParticleTrigger is called when any particles in a particle system meet the conditions in the trigger module.</summary>
        public static Subject<Unit> OnParticleTriggerAsObservable(this Component component)
        {
            if (component == null || component.gameObject == null) return Observable.Empty<Unit>() as Subject<Unit>;
            return GetOrAddComponent<ObservableParticleTrigger>(component.gameObject).OnParticleTriggerAsObservable() as Subject<Unit>;
        }

#endif

        #endregion
    }
}