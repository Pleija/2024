using System;
using System.Linq;
using System.Runtime.CompilerServices;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.UI.Extensions;

namespace App
{
    using UnityEngine;
    using UnityEngine.EventSystems;

    // 挂载在子item上
    public class ScrollRectFix : Agent<ScrollRectFix>, IBeginDragHandler, IEndDragHandler, IDragHandler
    {
        public GameObject Parent; //当子item是动态对象，需要动态去设置这个parent

        //滑动方向
        public Direction m_direction = Direction.Vertical;

        //当前操作方向
        [SerializeField]
        private Direction m_BeginDragDirection = Direction.Horizontal;

        private void Reset()
        {
            var ps = GetComponentsInParent<ScrollRect>(true);
            Parent = (ps.Length > 1 ? ps[1] : ps.First()).gameObject;
            // var scroll = GetComponent<ScrollRect>();
            // m_BeginDragDirection = scroll.horizontal ? Direction.Horizontal : Direction.Vertical;
            // m_direction = m_BeginDragDirection == Direction.Horizontal ? Direction.Vertical
            //     : Direction.Horizontal;
        }

        public enum Direction { Horizontal, Vertical }

        public void OnBeginDrag(PointerEventData eventData)
        {
            if (Parent) {
                m_BeginDragDirection = Mathf.Abs(eventData.delta.x) > Mathf.Abs(eventData.delta.y)
                    ? Direction.Horizontal : Direction.Vertical;
                //var scroll = GetComponentsInChildren<ScrollRect>();
                var snap = GetComponentsInParent<HorizontalScrollSnap>().Last();
                var old = Parent;
                //Debug.Log($"{eventData.delta.x} =>  {snap.gameObject.GetPath()}");
                if (snap.CurrentPage == snap.ChildObjects.Length - 1 && m_BeginDragDirection == Direction.Horizontal &&
                    eventData.delta.x > 0)
                    Parent = snap.gameObject;
                //Debug.Log($"{eventData.delta.x} => {Parent.GetPath()}");
                else if (snap.CurrentPage == 0 && m_BeginDragDirection == Direction.Horizontal && eventData.delta.x < 0)
                    Parent = snap.gameObject;
                else
                    Parent = GetComponentsInParent<HorizontalScrollSnap>().First().gameObject;
                //ExecuteEvents.Execute(Parent, eventData, ExecuteEvents.beginDragHandler);
                PassEvent(eventData, ExecuteEvents.beginDragHandler, true);
            }
        }

        public void OnDrag(PointerEventData eventData)
        {
            PassEvent(eventData, ExecuteEvents.dragHandler);
        }

        public void OnEndDrag(PointerEventData eventData)
        {
            PassEvent(eventData, ExecuteEvents.endDragHandler);
        }

        public bool isDebug = false;

        // 渗透方法
        private void PassEvent<T>(PointerEventData data, ExecuteEvents.EventFunction<T> func, bool isBegin = false,
            [CallerMemberName] string callname = "") where T : IEventSystemHandler
        {
            if (isDebug) Debug.Log($"{callname} => begin: {isBegin}");

            if (Parent != null)
                //当前操作方向不等于滑动方向，将事件传给父对象
                if (m_BeginDragDirection != m_direction) {
                    Parent = ExecuteEvents.GetEventHandler<T>(Parent);
                    ExecuteEvents.Execute(Parent, data, func);
                    //Debug.Log($"{data.delta.x} => {Parent.GetPath()}");
                }
        }

        // public void OnScroll(PointerEventData eventData)
        // {
        //     Debug.Log($"disable wheel");
        // }
    }
}
