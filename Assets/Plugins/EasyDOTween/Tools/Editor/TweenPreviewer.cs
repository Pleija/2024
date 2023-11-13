using System.Linq;
using System.Reflection;
using DG.DOTweenEditor;
using DG.Tweening;
using UnityEditor;
using UnityEngine;

namespace EasyDOTween.Editor
{
    [CustomPropertyDrawer(typeof(TweenPreviewAttribute))]
    public class TweenPreviewer : PropertyDrawer
    {
        private const float GAP = 2f;
        private MethodView[] _methods;

        public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
        {
            EditorGUI.PropertyField(position, property, true);
            if(!property.isExpanded) return;
            var height = EditorGUI.GetPropertyHeight(property, true);
            position.y += height + GAP;
            var h = EditorGUI.GetPropertyHeight(property, false);
            var attr = attribute as TweenPreviewAttribute;
            _methods = _methods ?? fieldInfo.FieldType
                .GetMethods(BindingFlags.Instance | BindingFlags.Public)
                .Where(x => x.ReturnType == typeof(Tween) && x.Name.Contains(attr.funcFilter))
                .Select(x => new MethodView(x, h)).ToArray();

            using(new EditorGUI.IndentLevelScope()) {
                foreach(var methodView in _methods) methodView.Render(ref position, property);
            }
        }

        public override float GetPropertyHeight(SerializedProperty property, GUIContent label)
        {
            float offset = 0;
            if(property.isExpanded && _methods != null) offset = _methods.Sum(x => x.height + GAP);
            return EditorGUI.GetPropertyHeight(property, true) + offset;
        }

        public override bool CanCacheInspectorGUI(SerializedProperty property) => false;

        private class MethodView
        {
            private const int BORDER_SIZE = 5;
            private const int INDENT_WIDTH = 15;
            private readonly MethodInfo _methodInfo;
            private readonly float _itemHeight;
            private readonly float _gap;
            public readonly float height;
            private readonly ParameterInfo[] _parameterInfos;
            private readonly object[] _parameters;
            private Tween _tween;

            public MethodView(MethodInfo methodInfo, float itemHeight = 16f, float gap = GAP)
            {
                _methodInfo = methodInfo;
                _itemHeight = itemHeight;
                _gap = gap;
                _parameterInfos = methodInfo.GetParameters();
                _parameters = new object[_parameterInfos.Length];
                height = (_parameters.Length + 1) * (itemHeight + gap) - gap + BORDER_SIZE * 2;
            }

            public void Render(ref Rect position, SerializedProperty property)
            {
                var pos = position;
                pos.height = height;
                float indentWidth = INDENT_WIDTH * EditorGUI.indentLevel;
                var boxPos = pos;
                SetIndent(ref boxPos, indentWidth - _gap);
                GUI.Box(boxPos, string.Empty);
                pos.width -= BORDER_SIZE * 2;
                pos.x += BORDER_SIZE;
                pos.y += BORDER_SIZE;
                pos.height = _itemHeight;

                for(var i = 0; i < _parameterInfos.Length; i++) {
                    var parameterInfo = _parameterInfos[i];
                    parameterInfo.EditorGUI(pos, ref _parameters[i]);
                    pos.y += _itemHeight + _gap;
                }
                SetIndent(ref pos, indentWidth);

                if(GUI.Button(pos, _tween == null ? _methodInfo.Name : "Stop")) {
                    if(_tween == null) {
                        _tween = (Tween)_methodInfo.Invoke(property.ReflectionGetTarget(),
                            _parameters);
                        _tween.OnComplete(CompleteTween);

                        if(!EditorApplication.isPlaying) {
                            DOTweenEditorPreview.PrepareTweenForPreview(_tween, false);
                            DOTweenEditorPreview.Start();
                        }
                    }
                    else {
                        _tween.Kill();
                        CompleteTween();
                    }
                }
                SetIndent(ref pos, -indentWidth);
                position.y = pos.y + _itemHeight + _gap + BORDER_SIZE;
            }

            private void CompleteTween()
            {
                if(!EditorApplication.isPlaying) DOTweenEditorPreview.Stop(true);
                _tween = null;
            }

            private void SetIndent(ref Rect position, float size)
            {
                position.x += size;
                position.width -= size;
            }
        }
    }
}
