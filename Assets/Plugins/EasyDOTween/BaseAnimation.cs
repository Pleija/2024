using DG.Tweening;
using UnityEngine;

namespace EasyDOTween
{
    public abstract class BaseAnimation : MonoBehaviour
    {
        [SerializeField]
        private bool _autoPlay = true;

        [SerializeField]
        private bool _speedBased;

        [SerializeField]
        private float _duration = 1;

        [SerializeField]
        private float _delay;

        [SerializeField]
        private int _loops;

        [SerializeField]
        private LoopType _loopType;

        [SerializeField]
        private Ease _ease = Ease.Linear;

        public Tween playingTween { get; private set; }

        protected virtual void Start()
        {
            if(_autoPlay) Play();
        }

        protected abstract Tween CreateTween(float duration);

        public Tween Play()
        {
            playingTween = CreateTween(_duration).SetSpeedBased(_speedBased).SetEase(_ease)
                .SetLoops(_loops, _loopType).SetDelay(_delay);
            return playingTween;
        }
    }
}
