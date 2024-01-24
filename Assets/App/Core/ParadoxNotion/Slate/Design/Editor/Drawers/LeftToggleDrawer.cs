#if UNITY_EDITOR

#region
using UnityEditor;
using UnityEngine;
#endregion

namespace Slate
{
    [CustomPropertyDrawer(typeof(LeftToggleAttribute))]
    public class LeftToggleDrawer : PropertyDrawer
    {
        public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
        {
            var attribute = (LeftToggleAttribute)this.attribute;

            if (property.propertyType == SerializedPropertyType.Boolean) {
                property.boolValue = EditorGUI.ToggleLeft(position, label, property.boolValue);
                return;
            }
            EditorGUI.LabelField(position, label.text, "Use LeftToggle with bool.");
        }
    }
}

#endif
