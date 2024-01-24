#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("Input (Legacy System)")]
    public class CheckKeyboardInput : ConditionTask
    {
        public KeyCode key = KeyCode.Space;
        public PressTypes pressType = PressTypes.Down;
        protected override string info => pressType + " " + key;

        protected override bool OnCheck()
        {
            if (pressType == PressTypes.Down) return Input.GetKeyDown(key);
            if (pressType == PressTypes.Up) return Input.GetKeyUp(key);
            if (pressType == PressTypes.Pressed) return Input.GetKey(key);
            return false;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void OnTaskInspectorGUI()
        {
            EditorGUILayout.BeginHorizontal();
            pressType = (PressTypes)EditorGUILayout.EnumPopup(pressType);
            key = (KeyCode)EditorGUILayout.EnumPopup(key);
            EditorGUILayout.EndHorizontal();
        }

#endif
    }
}
