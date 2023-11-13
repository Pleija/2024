using System;
using DG.Tweening;
using UnityEngine;

namespace EasyDOTween
{
    [Serializable]
    public class PocoSequence<A, T, V> where A : PocoAnimation<T, V>
    {
        [SerializeField]
        private A[] _animations;

        public virtual Tween Play(T target)
        {
            var sequence = DOTween.Sequence();
            foreach(var animation in _animations) sequence.Append(animation.Play(target));
            return sequence;
        }
    }
}
