#if UNITY_EDITOR

#region
using Slate.ActionClips;
using UnityEditor;
#endregion

namespace Slate
{
    [CustomEditor(typeof(CharacterExpression))]
    public class CharacterExpressionInspector : ActionClipInspector<CharacterExpression>
    {
        public override void OnInspectorGUI()
        {
            ShowCommonInspector();

            if (action.actor != null) {
                var character = action.actor.GetComponent<Character>();

                if (character != null) {
                    BlendShapeGroup current = null;
                    if (!string.IsNullOrEmpty(action.expressionUID))
                        current = character.FindExpressionByUID(action.expressionUID);
                    else
                        current = character.FindExpressionByName(action.expressionName);
                    var newExp = EditorTools.Popup("Expression", current, character.expressions);
                    action.expressionName = newExp != null ? newExp.name : null;
                    action.expressionUID = newExp != null ? newExp.UID : null;
                }
            }
            ShowAnimatableParameters();
        }
    }
}

#endif
