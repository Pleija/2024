#if UNITY_EDITOR

#region
using UnityEditor;
using UnityEngine;
#endregion

namespace Slate
{
    [CustomPropertyDrawer(typeof(HelpBoxAttribute))]
    public class HelpBoxDrawer : DecoratorDrawer
    {
        public override float GetHeight() => -2;

        public override void OnGUI(Rect position)
        {
            if (Prefs.showDescriptions)
                EditorGUILayout.HelpBox((attribute as HelpBoxAttribute).text, MessageType.None);
        }
    }
}

#endif
