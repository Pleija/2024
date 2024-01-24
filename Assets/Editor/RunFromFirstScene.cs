#if UNITY_EDITOR

#region
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Sirenix.Utilities;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Assertions;
using UnityEngine.SceneManagement;
using EditorBuildSettings = UnityEditor.EditorBuildSettings;
#endregion

// using Runtime;
#pragma warning disable CS0618

namespace Editors
{
    public class RunFromFirstScene
    {
        private const string kMenuText = "Assets/Run from first Scene";
        private static List<string> closedPath = new List<string>();
        private static List<string> openedPath = new List<string>();
        private static string currentPath;
        private static bool enabled => EditorPrefs.GetBool(kMenuText, true);

        [MenuItem(kMenuText)]
        private static void SetMenu()
        {
            // Check/Uncheck menu.
            var isChecked = !Menu.GetChecked(kMenuText);
            Menu.SetChecked(kMenuText, isChecked);

            // Save to EditorPrefs.
            EditorPrefs.SetBool(kMenuText, isChecked);
        }

        [MenuItem(kMenuText, true)]
        private static bool Valid()
        {
            // Check/Uncheck menu from EditorPrefs.
            Menu.SetChecked(kMenuText, EditorPrefs.GetBool(kMenuText, true));
            return true;
        }

        [InitializeOnLoadMethod]
        private static void ClearScenes()
        {
            EditorApplication.playModeStateChanged -= OnEditorApplicationOnplayModeStateChanged;
            EditorApplication.playModeStateChanged += OnEditorApplicationOnplayModeStateChanged;
        }

        private static void OnEditorApplicationOnplayModeStateChanged(PlayModeStateChange mode)
        {
            if (mode == PlayModeStateChange.ExitingEditMode) {
                if (!enabled) return;
                currentPath = SceneManager.GetActiveScene().path;
                EditorPrefs.SetString("current.scene", currentPath);
                closedPath.Clear();
                EditorSceneManager.SaveOpenScenes();
                // EditorSceneManager.SaveModifiedScenesIfUserWantsTo(SceneManager.GetAllScenes()
                //     .Where(x => x.isDirty)
                //     .ToArray());
                SceneManager.GetAllScenes()
                        .Distinct()
                        .Where(x => !x.isLoaded && !string.IsNullOrEmpty(x.path))
                        .ForEach(x => {
                            if (!closedPath.Contains(x.path)) {
                                closedPath.Add(x.path);
                                Debug.Log($"[closed] {x.path}");
                                EditorSceneManager.CloseScene(x, true);
                            }
                        });
                openedPath.Clear();
                SceneManager.GetAllScenes()
                        .Distinct()
                        .Where(x => x.isLoaded && !string.IsNullOrEmpty(x.path))
                        .ForEach(x => {
                            if (!openedPath.Contains(x.path)) {
                                openedPath.Add(x.path);
                                Debug.Log($"[opened] {x.path}");
                                if (x.path != currentPath) EditorSceneManager.CloseScene(x, true);
                            }
                        });
                EditorPrefs.SetString("opened.scenes", JsonConvert.SerializeObject(openedPath));
                EditorPrefs.SetString("closed.scenes", JsonConvert.SerializeObject(closedPath));
                var firstScene = EditorBuildSettings.scenes.First(x => x.enabled);
                Assert.IsFalse(firstScene.path.IsNullOrWhitespace(),
                    "firstScene.path.IsNullOrWhitespace()");
                Debug.Log($"first Scene: {firstScene.path}");
                if (SceneManager.GetActiveScene().path != firstScene.path)
                    EditorSceneManager.OpenScene(firstScene.path);
            }
            else if (mode == PlayModeStateChange.EnteredEditMode) {
                if (!enabled) return;
                openedPath =
                        JsonConvert.DeserializeObject<List<string>>(
                            EditorPrefs.GetString("opened.scenes"));
                closedPath =
                        JsonConvert.DeserializeObject<List<string>>(
                            EditorPrefs.GetString("closed.scenes"));
                closedPath.ForEach(x => {
                    EditorSceneManager.OpenScene(x, OpenSceneMode.AdditiveWithoutLoading);
                });
                openedPath.ForEach(x => {
                    EditorSceneManager.OpenScene(x, OpenSceneMode.Additive);
                });
                var current = SceneManager.GetActiveScene();
                currentPath = EditorPrefs.GetString("current.scene");
                var cur = SceneManager.GetAllScenes().FirstOrDefault(x => x.path == currentPath);
                if (cur.IsValid()) SceneManager.SetActiveScene(cur);
                if (!openedPath.Contains(current.path) && SceneManager.sceneCount > 1)
                    EditorSceneManager.CloseScene(current, !closedPath.Contains(current.path));
            }
        }
    }
}

#endif
