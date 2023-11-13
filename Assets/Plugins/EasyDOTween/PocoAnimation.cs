using System;
using DG.Tweening;
using UnityEngine;

namespace EasyDOTween
{
    [Serializable]
    public abstract class PocoAnimation<T, V>
    {
        [SerializeField]
        private float _duration;

        [SerializeField]
        private V _endValue;

        [SerializeField]
        private Ease _ease;

        public Tween Play(T target) => Play(target, _endValue, _duration).SetEase(_ease);
        protected abstract Tween Play(T target, V endValue, float duration);
    }
}
