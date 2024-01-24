#if UNITY_EDITOR

#region
using System.IO;
using System.Linq;
using ParadoxNotion;
using Sirenix.Utilities;
using UnityEngine;
using UnityEngine.SceneManagement;
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
#endif
#endregion

namespace MoreTags
{
    public class SavingHooks : /*AssetPostprocessor*/AssetModificationProcessor
    {
        private static bool isApply;
        private static bool isSaving;

        [InitializeOnLoadMethod]
        private static void StartInitializeOnLoadMethod()
        {
            // 注册Apply时的回调
            PrefabUtility.prefabInstanceUpdated = delegate(GameObject instance) {
                if (isApply) return;
                isApply = true;
                if (instance && !instance.TryGetComponent(typeof(TagsRef), out _))
                    SavePrefab(instance);
                isApply = false;
            };
        }

        private static void SavePrefab(GameObject instance)
        {
            var comp = instance.GetAddComponent<TagsRef>();
        }

        private void OnPostprocessPrefab(GameObject g)
        {
            Debug.Log(g.GetPath());
            //     var target = g.Children(x => x.TryGetComponent(typeof(TagsRef), out var v)).FirstOrDefault();
            //
            //     if (!target) {
            //           context.AddObjectToAsset("tagsref",new GameObject(nameof(TagsRef), typeof(TagsRef)))
            // ;//.Of(x => x.transform.SetParent(g.transform));
            //     }
            //Apply(g.transform);
        }

        private void Apply(Transform t)
        {
            if (t.name.ToLower().Contains("collider")) t.gameObject.AddComponent<MeshCollider>();

            // Recurse
            foreach (Transform child in t) Apply(child);
        }

        private static void OnWillSaveAssets(string[] paths)
        {
            Debug.Log($"Save Assets: {paths.JoinStr("\n")}");
            if (isSaving) return;
            isSaving = true;
            // foreach (string path in paths)
            //     Debug.Log(path);
            paths.Where(x => x.EndsWith(".prefab"))
                    .ForEach(path => {
                        void OnDelayCall()
                        {
                            EditorApplication.delayCall -= OnDelayCall;
                            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
                            if (prefab.Children(x => x.gameObject.name == nameof(TagsRef))
                                    .FirstOrDefault() is { })
                                return;
                            var go = PrefabUtility.InstantiatePrefab(prefab) as GameObject;
                            var target = go.Children(x => x.gameObject.name == nameof(TagsRef))
                                    .FirstOrDefault()
                                    ?.gameObject;

                            // if (target && target.hideFlags != HideFlags.HideInHierarchy) {
                            //     Object.DestroyImmediate(target);
                            // }
                            if (!target)
                                target = new GameObject(nameof(TagsRef), typeof(TagsRef)).Of(x => {
                                    x.transform.SetParent(go.transform);
                                });
                            target.hideFlags = HideFlags.HideInHierarchy;
                            PrefabUtility.SaveAsPrefabAssetAndConnect(go, path,
                                InteractionMode.AutomatedAction);
                            // This save will affect all prefab in Scene!
                            Object.DestroyImmediate(go);

                            //go.AddComponent<TagsRef>();
                            //PrefabUtility.SavePrefabAsset(go);
                            //Object.DestroyImmediate(go);

                            // if (origin.TryGetComponent<TagsRef>(out var component)) {
                            Debug.Log(
                                $"added: {Path.GetFileNameWithoutExtension(path)}:{nameof(TagsRef)}");
                        }

                        EditorApplication.delayCall += OnDelayCall;

                        // }
                        // else {
                        //     var state = origin.activeSelf;
                        //     origin.SetActive(false);
                        //
                        //     var com = go.AddComponent<TagsRef>();
                        //     //PrefabUtility.ApplyAddedComponent(com, path, InteractionMode.AutomatedAction);
                        //     Debug.Log($"add {Path.GetFileNameWithoutExtension(path)}:{nameof(TagsRef)}");
                        //     PrefabUtility.SaveAsPrefabAsset(go, path);
                        //     if (state) origin.SetActive(true);
                        //     Object.DestroyImmediate(go);
                        // }

                        //go.GetAddComponent<TagsRef>();
                        //EditorUtility.SetDirty(go);
                        //PrefabUtility.SavePrefabAsset(go);
                        // var target = go.Children(t => t.TryGetComponent(typeof(TagsRef), out _)).FirstOrDefault();
                        //
                        // if (target == null) {
                        //     target = new GameObject(nameof(TagsRef), typeof(TagsRef)).transform.Of(x =>
                        //         x.SetParent(go.transform));
                        //     PrefabUtility.
                        // }
                        // else {
                        // }
                        // target.gameObject.hideFlags = HideFlags.HideInHierarchy;
                    });
            isSaving = false;
        }

        [InitializeOnLoadMethod]
        private static void OnSaveScene()
        {
            EditorSceneManager.sceneSaving += (scene, path) => {
                Debug.Log($"Saving: {path}");
                var refs = scene.GetRootGameObjects()
                        .FirstOrDefault(t => t.name == nameof(TagsRef));

                if (!refs) {
                    refs = new GameObject(nameof(TagsRef), typeof(TagsRef));
                    refs.hideFlags = HideFlags.HideInHierarchy;
                    SceneManager.MoveGameObjectToScene(refs, scene);
                    Debug.Log($"Create: {scene.name}:{nameof(TagsRef)}", refs);
                }
                var ids = scene.GetRootGameObjects()
                        .FirstOrDefault(x => x.name == nameof(ObjectIds));

                if (ids == null) {
                    ids = new GameObject(nameof(ObjectIds));
                    SceneManager.MoveGameObjectToScene(ids, scene);
                }
                ids.hideFlags = HideFlags.HideInHierarchy;
                ids.RequireComponent<ObjectIds>().Save();
            };
        }
    }
}
#endif
