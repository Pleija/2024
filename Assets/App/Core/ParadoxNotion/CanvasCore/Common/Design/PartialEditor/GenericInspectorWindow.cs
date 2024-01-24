#if UNITY_EDITOR

#region
using System;
using Sirenix.OdinInspector.Editor;
using UnityEditor;
using UnityEngine;
using Object = UnityEngine.Object;
#endregion

namespace ParadoxNotion.Design
{
    ///<summary>A generic popup editor</summary>
    public class GenericInspectorWindow : OdinEditorWindow
    {
        private static GenericInspectorWindow current;
        private string friendlyTitle;
        private Type targetType;
        private Object unityObjectContext;
        private Func<object> read;
        private Action<object> write;
        private Vector2 scrollPos;
        private bool willRepaint;

        // ...
        protected override void OnEnable()
        {
            base.OnEnable();
            titleContent = new GUIContent("Object Editor");
            current = this;
#if UNITY_2017_2_OR_NEWER
            EditorApplication.playModeStateChanged -= PlayModeChange;
            EditorApplication.playModeStateChanged += PlayModeChange;
#else
            EditorApplication.playmodeStateChanged -= PlayModeChange;
            EditorApplication.playmodeStateChanged += PlayModeChange;
#endif
        }

        //...
        protected override void OnDisable()
        {
            base.OnDisable();
#if UNITY_2017_2_OR_NEWER
            EditorApplication.playModeStateChanged -= PlayModeChange;
#else
            EditorApplication.playmodeStateChanged -= PlayModeChange;
#endif
        }

#if UNITY_2017_2_OR_NEWER
        private void PlayModeChange(PlayModeStateChange state)
        {
            Close();
        }
#else
        void PlayModeChange()
        {
            Close();
        }
#endif

        /// <summary>
        ///     Open utility window to inspect target object of type in context using read/write
        ///     delegates.
        /// </summary>
        public static void Show(string title, Type targetType, Object unityObjectContext,
            Func<object> read, Action<object> write)
        {
            var window = current != null ? current : CreateInstance<GenericInspectorWindow>();
            window.friendlyTitle = title;
            window.targetType = targetType;
            window.unityObjectContext = unityObjectContext;
            window.write = write;
            window.read = read;
            window.ShowUtility();
        }

        //...
        private void Update()
        {
            if (willRepaint) {
                willRepaint = false;
                Repaint();
            }
        }

        //...
        protected override void OnGUI()
        {
            base.OnGUI();
            if (targetType == null) return;
            var e = Event.current;

            if (e.type == EventType.ValidateCommand && e.commandName == "UndoRedoPerformed") {
                GUIUtility.hotControl = 0;
                GUIUtility.keyboardControl = 0;
                e.Use();
                return;
            }
            GUILayout.Space(10);
            GUILayout.Label(string.Format("<size=14><b>{0}</b></size>", targetType.FriendlyName()),
                Styles.centerLabel);
            EditorUtils.Separator();
            GUILayout.Space(10);
            scrollPos = GUILayout.BeginScrollView(scrollPos);
            var serializationInfo = new InspectedFieldInfo(unityObjectContext, null, null, null);
            var oldValue = read();
            var newValue = EditorUtils.ReflectedFieldInspector(friendlyTitle, oldValue, targetType,
                serializationInfo);
            if (!Equals(oldValue, newValue) || GUI.changed) write(newValue);
            GUILayout.EndScrollView();
            willRepaint = true;
        }
    }
}

#endif
