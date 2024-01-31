#if UNITY_EDITOR
using UnityEditor.SceneManagement;

#endif
using UnityEngine;

namespace Extensions
{
    public static partial class Scenes
    {
        public static void SetDirty(this UnityEngine.SceneManagement.Scene scene) {
            #if UNITY_EDITOR
            if (!Application.isPlaying) EditorSceneManager.MarkSceneDirty(scene);
            #endif
        }
    }
}
