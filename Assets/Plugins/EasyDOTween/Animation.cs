using DG.Tweening;
using UnityEngine;

namespace EasyDOTween
{
    public abstract class Animation<T> : BaseAnimation
    {
        [SerializeField]
        private T _target;

        protected override void Start()
        {
            if(_target == null) _target = GetComponent<T>();
            base.Start();
        }

#if UNITY_EDITOR
        private void Reset()
        {
            if(_target == null) _target = GetComponent<T>();
        }
#endif
        protected abstract Tween CreateTween(T target, float duration);
        protected override Tween CreateTween(float duration) => CreateTween(_target, duration);
    }
}
