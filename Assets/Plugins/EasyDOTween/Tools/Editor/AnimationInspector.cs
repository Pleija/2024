using DG.DOTweenEditor;
using DG.Tweening;
using UnityEditor;
using UnityEngine;

namespace EasyDOTween.Editor
{
    [CustomEditor(typeof(BaseAnimation), true)]
    public class AnimationInspector : UnityEditor.Editor
    {
        private BaseAnimation _target;
        private Tween _tween;

        private void OnEnable()
        {
            _target = target as BaseAnimation;
        }

        public override void OnInspectorGUI()
        {
            base.OnInspectorGUI();

            if(GUILayout.Button(_tween == null ? "Play" : "Stop")) {
                if(_tween == null) {
                    _tween = _target.Play();
                    _tween.OnComplete(CompleteTween);
                    DOTweenEditorPreview.PrepareTweenForPreview(_tween, false);
                    DOTweenEditorPreview.Start();
                }
                else {
                    _tween.Kill();
                    CompleteTween();
                }
            }
        }

        private void CompleteTween()
        {
            DOTweenEditorPreview.Stop(true);
            _tween = null;
        }
    }
}
