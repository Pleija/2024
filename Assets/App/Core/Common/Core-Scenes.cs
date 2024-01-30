using System;
using System.Reflection;
using UnityEngine;
using Object = UnityEngine.Object;
#if UNITY_EDITOR
using UnityEditor;
#if UNITY_2020
using UnityEditor.Experimental.SceneManagement;

#else
using UnityEditor.SceneManagement;
#endif
#endif

namespace Runtime
{
    public static partial class Core
    {
        public static bool IsPrefabScene() {
            #if UNITY_EDITOR
            return PrefabStageUtility.GetCurrentPrefabStage() != null;
            #endif
            return false;
        }

        #if UNITY_EDITOR
        public static EditorWindow GetMainGameView() {
            var assembly = typeof(EditorWindow).Assembly;
            var type = assembly.GetType("UnityEditor.GameView");
            var gameview = EditorWindow.GetWindow(type);
            return gameview;
        }
        #endif

        public static void ShowNotice(string test, Object target = null) {
            #if UNITY_EDITOR
            GetMainGameView().ShowNotification(new GUIContent(test));
            EditorWindow.GetWindow<SceneView>().ShowNotification(new GUIContent(test));
            #endif
            Debug.Log(test.ToYellow(), target);
        }
    }
}
