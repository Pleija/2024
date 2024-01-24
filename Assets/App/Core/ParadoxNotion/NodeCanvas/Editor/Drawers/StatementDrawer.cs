#if UNITY_EDITOR

#region
using NodeCanvas.DialogueTrees;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.Editor
{
    ///<summary>A drawer for dialogue tree statements</summary>
    public class StatementDrawer : ObjectDrawer<Statement>
    {
        public override Statement OnGUI(GUIContent content, Statement instance)
        {
            if (instance == null) instance = new Statement("...");
            instance.text = EditorGUILayout.TextArea(instance.text, Styles.wrapTextArea,
                GUILayout.Height(100));
            instance.audio = EditorGUILayout.ObjectField(
                "Audio File", instance.audio, typeof(AudioClip), false) as AudioClip;
            instance.meta = EditorGUILayout.TextField("Metadata", instance.meta);
            return instance;
        }
    }
}

#endif
