using System.IO;
using System.Linq;
using ParadoxNotion;
using Sirenix.Utilities;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MoreTags
{
    public class SavingHooks : /*AssetPostprocessor*/AssetModificationProcessor
    {
        private static bool isApply;

        [InitializeOnLoadMethod]
        static void StartInitializeOnLoadMethod()
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

        void OnPostprocessPrefab(GameObject g)
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

        void Apply(Transform t)
        {
            if (t.name.ToLower().Contains("collider"))
                t.gameObject.AddComponent<MeshCollider>();

            // Recurse
            foreach (Transform child in t)
                Apply(child);
        }

        private static bool isSaving;

        static void OnWillSaveAssets(string[] paths)
        {
            Debug.Log($"Save Assets: {paths.JoinStr("\n")}");
            if (isSaving) return;
            isSaving = true;
            // foreach (string path in paths)
            //     Debug.Log(path);
            paths.Where(x => x.EndsWith(".prefab")).ForEach(path => {
                void OnDelayCall()
                {
                    EditorApplication.delayCall -= OnDelayCall;
                    var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);

                    if (!prefab || prefab.TryGetComponent(typeof(TagsRef), out _)) {
                        //Debug.Log($"Cannot load: {path}");
                        return;
                    }
                    var go = Object.Instantiate(prefab);
                    if (!go || go.TryGetComponent(typeof(TagsRef), out _)) {
                        //Debug.Log($"Cannot load: {path}");
                        return;
                    }
                    go.AddComponent<TagsRef>();
                    PrefabUtility.ReplacePrefab(go, prefab);
                    Object.DestroyImmediate(go);

                    // if (origin.TryGetComponent<TagsRef>(out var component)) {
                    Debug.Log($"added: {Path.GetFileNameWithoutExtension(path)}:{nameof(TagsRef)}");
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
        static void OnSaveScene()
        {
            EditorSceneManager.sceneSaving += (scene, path) => {
                Debug.Log($"Saving: {path}");
                var refs = scene.GetRootGameObjects().FirstOrDefault(t => t.name == nameof(TagsRef));

                if (!refs) {
                    refs = new GameObject(nameof(TagsRef), typeof(TagsRef));
                    refs.hideFlags = HideFlags.HideInHierarchy;
                    SceneManager.MoveGameObjectToScene(refs, scene);
                    Debug.Log($"Create: {scene.name}:{nameof(TagsRef)}", refs);
                }
            };
        }
    }
}
