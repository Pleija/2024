#if UNITY_EDITOR

#region
using System;
using UnityEditor;
using UnityEngine;
using Object = UnityEngine.Object;
#endregion

namespace Slate
{
    ///<summary>A popup window to select a camera shot with a preview</summary>
    public class ShotPicker : PopupWindowContent
    {
        private Action<ShotCamera> callback;
        private IDirector director;
        private Vector2 scrollPos;

        public ShotPicker(IDirector director, Action<ShotCamera> callback)
        {
            this.director = director;
            this.callback = callback;
        }

        ///<summary>Shows the popup menu at position and with title</summary>
        public static void Show(Vector2 pos, IDirector director, Action<ShotCamera> callback)
        {
            PopupWindow.Show(new Rect(pos.x, pos.y, 0, 0), new ShotPicker(director, callback));
        }

        public override Vector2 GetWindowSize() => new Vector2(300, 600);

        public override void OnGUI(Rect rect)
        {
            GUILayout.BeginVertical("box");
            scrollPos = EditorGUILayout.BeginScrollView(scrollPos, false, false);

            foreach (var shot in Object.FindObjectsOfType<ShotCamera>()) {
                var res = EditorTools.GetGameViewSize();
                var texture = shot.GetRenderTexture((int)res.x, (int)res.y);

                if (GUILayout.Button(texture, GUILayout.Width(262), GUILayout.Height(120))) {
                    callback(shot);
                    editorWindow.Close();
                    return;
                }
                var r = GUILayoutUtility.GetLastRect();
                r.x += 10;
                r.y += 10;
                r.width -= 20;
                r.height = 18;
                GUI.color = new Color(0.2f, 0.2f, 0.2f, 0.8f);
                GUI.DrawTexture(r, Styles.whiteTexture);
                GUI.color = Color.white;
                GUI.Label(r, shot.name, Styles.leftLabel);
            }
            EditorGUILayout.EndScrollView();
            GUILayout.Space(10);

            if (GUILayout.Button("Create Shot")) {
                callback(ShotCamera.Create(director.context.transform));
                editorWindow.Close();
            }
            GUILayout.Space(10);
            GUILayout.EndVertical();
        }
    }
}

#endif
