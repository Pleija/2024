using System;
using DG.Tweening;
using EasyDOTween;
using UnityEngine;

public class Test : MonoBehaviour
{
    [SerializeField, TweenPreview]
    private PocoDOScale _doScale;

    [SerializeField, TweenPreview]
    private PocoDOScaleSequence _doScaleSequence;

    [SerializeField, TweenPreview]
    private MoveTo _moveTo;

    [SerializeField]
    private TweenAnimBundle _bundle;

    [Serializable]
    private class MoveTo
    {
        [SerializeField]
        private Vector3 _pos;

        [SerializeField]
        private float _duration;

        public Tween PlayMoveX(Transform t) => t.DOMoveX(_pos.x, _duration);
        public Tween PlayMoveY(Transform t) => t.DOMoveY(_pos.y, _duration);
    }

    [Serializable]
    private class TweenAnimBundle
    {
        [SerializeField, TweenPreview]
        private MoveTo _moveTo;
    }

    [Serializable]
    public class PocoDOScale : PocoAnimation<Transform, Vector3>
    {
        protected override Tween Play(Transform target, Vector3 endValue, float duration) =>
            target.DOScale(endValue, duration);
    }

    [Serializable]
    public class PocoDOScaleSequence : PocoSequence<PocoDOScale, Transform, Vector3> { }
}
