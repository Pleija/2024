#if UNITY_EDITOR

#region
using UnityEditor;
using UnityEngine;
#endregion

namespace Slate
{
    [CustomPropertyDrawer(typeof(ReadOnlyAttribute))]
    public class ReadOnlyDrawer : PropertyDrawer
    {
        public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
        {
            var wasEnable = GUI.enabled;
            GUI.enabled = false;
            EditorGUI.PropertyField(position, property, label);
            GUI.enabled = wasEnable;
        }
    }
}

#endif
