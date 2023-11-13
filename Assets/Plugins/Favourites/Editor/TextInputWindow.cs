using Sirenix.OdinInspector.Editor;
using UnityEditor;
using UnityEngine;

namespace Favourites.Editor
{
    public class TextInputWindow : OdinEditorWindow
    {
        public string Text { get; private set; }
        public object[] Args { get; private set; }
        static GUIStyle BottomBarStyle;
        string label;
        System.Action<TextInputWindow> callback;
        bool accepted = false;
        bool lostFocus = false;

        // [FormerlySerializedAs("Proto"),FormerlySerializedAs("Probo"),ShowInInspector]
        // public TextAsset Protobuf;

        public static void ShowWindow(string title, string label, string currText,
            System.Action<TextInputWindow> callback, object[] args, float width = 250) {
            var win = GetWindow<TextInputWindow>(true, title, true);
            win.label = label;
            win.Text = currText;
            win.callback = callback;
            win.Args = args;
            win.minSize = win.maxSize = new Vector2(width, 200);
            win.ShowUtility();
        }

        void OnFocus() {
            lostFocus = false;
        }

        void OnLostFocus() {
            lostFocus = true;
        }

        void Update() {
            if (lostFocus) Close();

            if (accepted && callback != null) callback(this);
        }

        protected override void OnGUI() {
            base.OnGUI();
            if (BottomBarStyle == null)
                BottomBarStyle = new GUIStyle(GUI.skin.FindStyle("ProjectBrowserBottomBarBg")) {
                    padding = new RectOffset(3, 3, 8, 8), stretchHeight = false, stretchWidth = true,
                    fixedHeight = 0, fixedWidth = 0, richText = false
                };

            EditorGUILayout.Space();
            GUILayout.Label(label);
            Text = EditorGUILayout.TextField(Text);
            GUILayout.FlexibleSpace();
            EditorGUILayout.BeginHorizontal(BottomBarStyle);
            {
                GUILayout.FlexibleSpace();
                if (GUILayout.Button("Accept", GUILayout.Width(80))) accepted = true;

                GUILayout.Space(5);
                if (GUILayout.Button("Cancel", GUILayout.Width(80))) Close();

                GUILayout.FlexibleSpace();
            }

            EditorGUILayout.EndHorizontal();
        }

        // ------------------------------------------------------------------------------------------------------------
    }
}
