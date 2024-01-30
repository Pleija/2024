// using Unity.Entities;

// #if UNITY_EDITOR
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Data;
using Enums;
using Extensions;
using MoreTags;
using Sirenix.Utilities;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEditor.Experimental.SceneManagement;
using UnityEngine;
using UnityEngine.Assertions;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using Object = UnityEngine.Object;

public static partial class Core
{
    public static Vector2 ScreenToRectPos(this RectTransform rectTransform, Vector2 screen_pos)
    {
        var canvas = rectTransform.GetComponentInParent<Canvas>();
        if (canvas.renderMode != RenderMode.ScreenSpaceOverlay && canvas.worldCamera != null) {
            //Canvas is in Camera mode
            Vector2 anchorPos;
            RectTransformUtility.ScreenPointToLocalPointInRectangle(rectTransform, screen_pos, canvas.worldCamera,
                out anchorPos);

            return anchorPos;
        }
        else {
            //Canvas is in Overlay mode
            var anchorPos = screen_pos - new Vector2(rectTransform.position.x, rectTransform.position.y);
            anchorPos = new Vector2(anchorPos.x / rectTransform.lossyScale.x,
                anchorPos.y / rectTransform.lossyScale.y);

            return anchorPos;
        }
    }

    public static IEnumerable<UnityEngine.SceneManagement.Scene> GetAllLoadedScenes()
    {
        for (var i = 0; i < SceneManager.sceneCount; i++) yield return SceneManager.GetSceneAt(i);
    }

    static readonly List<Action> m_ReloadActions = new List<Action>();

    public static DirectoryInfo CreateNewFolder(this string folderPath)
    {
#if UNITY_EDITOR
        if (folderPath == null) folderPath = AssetDatabase.GetAssetPath(Selection.activeInstanceID);

        // string folderPath = AssetDatabase.GetAssetPath(Selection.activeInstanceID);
        if (folderPath.Contains(".")) folderPath = folderPath.Remove(folderPath.LastIndexOf('/'));

        var dir = Directory.CreateDirectory(folderPath + "/New Folder");
        AssetDatabase.Refresh();
        return dir;
#endif
        return null;
    }

    // public static T Instantiate<T>(T original, Vector3 position, Quaternion rotation) where T : Object => (T) Object.Instantiate((Object) original, position, rotation);
    //
    // public static T Instantiate<T>(
    //     T original,
    //     Vector3 position,
    //     Quaternion rotation,
    //     Transform parent)
    //     where T : Object
    // {
    //     return (T) Object.Instantiate((Object) original, position, rotation, parent);
    // }
    //
    // public static T Instantiate<T>(T original, Transform parent) where T : Object => Object.Instantiate<T>(original, parent, false);
    //
    // public static T Instantiate<T>(T original, Transform parent, bool worldPositionStays) where T : Object => (T) Object.Instantiate((Object) original, parent, worldPositionStays);
    public static void Destroy(this GameObject gameObject)
    {
        gameObject?.DestroySelf();
    }

    // public static Component SetEcsComponent<T>(this Component component, Func<T, T> action = null)
    //     where T : struct, IComponentData
    // {
    //     var type = typeof(T).Assembly.GetType(typeof(T).FullName + "Authoring");
    //
    //     if (type == null) {
    //         return null;
    //     }
    //
    //     var ecsComponent = component.RequireComponent(type);
    //     component.RequireComponent<ConvertToEntity>().ConversionMode =
    //         ConvertToEntity.Mode.ConvertAndInjectGameObject;
    //     var data = new T();
    //
    //     if (action != null) {
    //         ecsComponent.GetType()
    //             .GetFields(BindingFlags.Public | BindingFlags.Instance)
    //             .ForEach(t => {
    //                 var field = data.GetType()
    //                     .GetField(t.Name, BindingFlags.Public | BindingFlags.Instance);
    //
    //                 if (field != null) {
    //                     field.SetValue(data, t.GetValue(ecsComponent));
    //                 }
    //             });
    //         data = action.Invoke(data);
    //     }
    //
    //     ecsComponent.GetType()
    //         .GetFields(BindingFlags.Public | BindingFlags.Instance)
    //         .ForEach(t => {
    //             var field = data.GetType()
    //                 .GetField(t.Name, BindingFlags.Public | BindingFlags.Instance);
    //
    //             if (field != null) {
    //                 t.SetValue(ecsComponent, field.GetValue(data));
    //             }
    //         });
    //
    //     return ecsComponent;
    // }

    public static GameObject PrefabRoot(this GameObject gameObject)
    {
        GameObject root = null;
#if UNITY_EDITOR
        var prefabStage = PrefabStageUtility.GetPrefabStage(gameObject);
        if (prefabStage != null) root = prefabStage.prefabContentsRoot;
#endif
        return root;
    }

    public static T[] FindAllOrInPrefab<T>(this GameObject gameObject) where T : Component
    {
        return PrefabRoot(gameObject) != null
            ? gameObject?.GetComponentsInChildren<T>(true)
            : Object.FindObjectsOfType<T>();
    }
#if UNITY_EDITOR
    [DidReloadScripts]
    static void ClearReloadActions()
    {
        //ReloadActions.ForEach(t => t?.Invoke());
        m_ReloadActions.Clear();
    }
#endif
    public static void RunOnceOnScriptReload(ref Action refs, Action action)
    {
        if (refs == null) {
            if (action != null && !m_ReloadActions.Contains(action)) {
                action.Invoke();
                m_ReloadActions.Add(action);
            }

            refs = action;
        }
    }

    // public static ScriptableObject FindOrCreatePreloadAsset(Type type) =>
    //     FindOrCreatePreloadAsset(ScriptableObject.CreateInstance(type));

    public static ScriptableObject FindOrCreatePreloadAsset(Type type)
    {
        ScriptableObject ret = null;

#if UNITY_EDITOR

        // if (EditorApplication.isCompiling || EditorApplication.isUpdating
        //     || EditorApplication.isPlayingOrWillChangePlaymode)
        //     return null;

        // var ret = AssetDatabase.FindAssets($"t:{type.FullName}")
        //     .Select(guid => AssetDatabase.LoadAssetAtPath(AssetDatabase.GUIDToAssetPath(guid), type))
        //     .FirstOrDefault(t => t != null);

        //if (!Core.IsUsingPackedPlayMode) {
        ret = PlayerSettings.GetPreloadedAssets()
                .FirstOrDefault(t => type != null && t?.GetType() == type && type.IsInstanceOfType(t)) as
            ScriptableObject ?? CheckLoadAsset(type) as ScriptableObject;

        // }
#endif
        if (ret == null) {
            ret = Resources.FindObjectsOfTypeAll(type).FirstOrDefault() as ScriptableObject;
            if (!ret && Application.isPlaying) {
                ret = DB.Table(ScriptableObject.CreateInstance(type)).FirstOrDefault();
            }
        }
        //;

#if UNITY_EDITOR
        if (ret == null || Strings.IsNullOrEmpty(AssetDatabase.GetAssetPath(ret))) {
            ret = ScriptableObject.CreateInstance(type);
            var configAssetDir = "Assets/GameData/Config";
            var path = $"{configAssetDir}/{type.Name}.asset";
            while (File.Exists(path)) path = $"{configAssetDir}/{type.Name}_{TempFilename()}";

            AssetDatabase.CreateAsset(ret, path.CreateDirFromFilePath());

            //AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            //AssetDatabase.Refresh();
            ret = AssetDatabase.LoadAssetAtPath(path.AssetPathNormal(), type) as ScriptableObject;
            Assert.IsNotNull(ret, $"{type.Name} != null");
            Debug.Log($"{type.FullName} created".ToRed(), ret);
        }

        Action press = () => {
            if (ret != null) {
                // Add the config asset to the build
                var preloadedAssets = PlayerSettings.GetPreloadedAssets().ToList();
                if (PlayerSettings.GetPreloadedAssets().All(t => t?.GetType() != type) && ret.GetType() == type) {
                    Debug.Log($"add preset: {type.FullName}".ToRed(), ret);
                    preloadedAssets.Add(ret);
                    PlayerSettings.SetPreloadedAssets(preloadedAssets.ToArray());
                    AssetDatabase.SaveAssets();
                }
                else {
                    // Debug.Log($"preset exists: {type.FullName} {AssetDatabase.GetAssetPath(PlayerSettings.GetPreloadedAssets().FirstOrDefault(t => t?.GetType() == type))}", ret);
                }
            }

            if (PlayerSettings.GetPreloadedAssets().Any(t => t == null)) {
                var preloadedAssets = PlayerSettings.GetPreloadedAssets().Where(t => t != null).ToArray();
                PlayerSettings.SetPreloadedAssets(preloadedAssets);
                AssetDatabase.SaveAssets();
            }
        };

        if (!Application.isPlaying) {
            press.Invoke();
        }
        else {
            Action clear = null;
            Action<PlayModeStateChange> tx = mode => {
                if (mode == PlayModeStateChange.EnteredEditMode) {
                    clear?.Invoke();
                    press.Invoke();
                }
            };
            clear += () => EditorApplication.playModeStateChanged -= tx;
            EditorApplication.playModeStateChanged += tx;
        }

#endif
        return ret;
    }

#if UNITY_EDITOR
    public static Object CheckLoadAsset(Type type)
    {
        return AssetDatabase.FindAssets($"t:{type.FullName}")
            .Select(guid => AssetDatabase.LoadAssetAtPath(AssetDatabase.GUIDToAssetPath(guid), type))
            .FirstOrDefault(t => t != null);
    }

    public static T CheckLoadAsset<T>() where T : Object
    {
        return AssetDatabase.FindAssets($"t:{typeof(T).FullName}")
            .Select(guid => AssetDatabase.LoadAssetAtPath<T>(AssetDatabase.GUIDToAssetPath(guid)))
            .FirstOrDefault(t => t != null);
    }
#endif

    public static T FindOrCreatePreloadAsset<T>(T scriptableObject = default) where T : ScriptableObject
    {
        return FindOrCreatePreloadAsset(typeof(T)) as T;

        //
        //#if UNITY_EDITOR
        //        var ret = PlayerSettings.GetPreloadedAssets().FirstOrDefault(t => t?.GetType() == typeof(T)) as T ??
        //            CheckLoadAsset<T>();
        //#else
        //            var ret = DB.Table<T>().FirstOrDefault() ;
        //#endif
        //#if UNITY_EDITOR
        //        if (ret == null) {
        //            var configAssetDir = "Assets/Settings";
        //            ret = DB.Table<T>().FirstOrDefault();
        //            var path = $"{configAssetDir}/{typeof(T).Name}-{Core.NewGuid()}.asset".CreateDirFromFilePath();
        //            AssetDatabase.CreateAsset(ret, path);
        //            AssetDatabase.SaveAssets();
        //            ret = AssetDatabase.LoadAssetAtPath<T>(path.AssetPath());
        //            Assert.IsNotNull(ret, "ret != null");
        //            Debug.Log($"{typeof(T).FullName} created", ret);
        //            AssetDatabase.Refresh();
        //        }
        //
        //        if (ret != null) {
        //            // Add the config asset to the build
        //            var preloadedAssets = PlayerSettings.GetPreloadedAssets().ToList();
        //            if (preloadedAssets.All(t => t?.GetType() != typeof(T))) {
        //                preloadedAssets.Add(ret);
        //                Debug.Log($"{typeof(T).FullName} added".ToRed(), ret);
        //                PlayerSettings.SetPreloadedAssets(preloadedAssets.ToArray());
        //                AssetDatabase.SaveAssets();
        //            }
        //        }
        //
        //#endif
        //        return ret;
    }

    public static T FindInPrefabOrScene<T>() where T : Component
    {
        //var manager = Core.FindObjectOfTypeAll<T>();
        var m_Instance = FindObjectOfTypeAll<T>();
        if (m_Instance == null) {
#if UNITY_EDITOR
            var found = AssetDatabase.FindAssets("t:GameObject")
                .Select(guid => AssetDatabase.LoadAssetAtPath<GameObject>(AssetDatabase.GUIDToAssetPath(guid)))
                .FirstOrDefault(go => go.GetComponentInChildren<T>() != null);

            if (found != null)
                m_Instance = (PrefabUtility.InstantiatePrefab(found) as GameObject)?.GetComponentInChildren<T>();
#endif
        }

        return m_Instance;
    }

    public static void ClearConsole() //you can copy/paste this code to the bottom of your script
    {
#if UNITY_EDITOR
        var assembly = Assembly.GetAssembly(typeof(Editor));
        var type = assembly.GetType("UnityEditor.LogEntries");
        var method = type.GetMethod("Clear");
        method?.Invoke(new object(), null);
#endif
    }

    // layout 动态添加内容后需要强制刷新,否则无法自动布局
    //LayoutRebuilder.ForceRebuildLayoutImmediate(recttransform);
    //参数为挂有Layout组件的recttransform
    //    为了确保能够正确的刷新
    //建议放在一个协程中，待帧结束后检测一次，若没有刷新再执行一次
    public static IEnumerator UpdateLayout(this RectTransform rect)
    {
        LayoutRebuilder.ForceRebuildLayoutImmediate(rect);
        yield return new WaitForEndOfFrame();

        var vecScale = rect.localScale;
        var width = rect.rect.width;
        var height = rect.rect.height;
        while (rect.rect.width == 0) {
            Debug.Log(rect.rect.width);
            LayoutRebuilder.ForceRebuildLayoutImmediate(rect);
            yield return new WaitForEndOfFrame();
        }
    }

    // => gameObject?.GetComponentsInParent<Transform>().Select(t => t.gameObject);
    //        public static IEnumerable<GameObject> GetParents(this GameObject gameObject)
    //
    //        {
    //            var gos = new List<GameObject>();
    //            while (gameObject != null) {
    //                gos.Add(gameObject);
    //                gameObject = gameObject.transform.parent?.gameObject;
    //            }
    //
    //            return gos;
    //        }
    //
    //        public static IEnumerable<GameObject> GetParents(this Component component) => GetParents(component?.gameObject);

    public static List<PropertyAttribute> GetFieldAttributes(FieldInfo field)
    {
        if (field == null) return null;

        var attrs = field.GetCustomAttributes(typeof(PropertyAttribute), true);
        if (attrs.Any())
            return new List<PropertyAttribute>(attrs.Select(e => e as PropertyAttribute).OrderBy(e => -e.order));

        return null;
    }

    public static T FindOrCreateManager<T>(string sceneName = null) where T : Component
    {
        // Editor 模式需要 FindObjectOfType
        var result = TagSystem.Find(typeof(T), null, Id.Managers) as T ?? Object.FindObjectOfType<T>();
        return result;

        if (result != null /*&& sceneName == SceneManager.GetActiveScene().name*/) return result;

        Assert.IsFalse(SceneManager.sceneCount == 0, "No opened Scene");
        var scene = Strings.IsNullOrEmpty(sceneName) || sceneName == SceneManager.GetActiveScene().name
            ? SceneManager.GetActiveScene()
            : SceneManager.GetSceneByName(sceneName);

        if (!scene.IsValid()) {
            scene = SceneManager.GetActiveScene();
            sceneName = scene.name;
        }

        Assert.IsTrue(scene.IsValid(), $"{scene.name} scene.IsValid()");

        //Assert.IsTrue(!scene.isLoaded);
        Debug.Log($"Scene Name: {scene.name}".ToBlue());
        var root = scene.GetRootGameObjects().FirstOrDefault(t => t.name == sceneName) ??
            new GameObject(sceneName).Of(go => SceneManager.MoveGameObjectToScene(go, scene));

        return root.GetComponentInChildren<T>(true) ??
            (root.transform.Find(typeof(T).Name) ?? new GameObject(typeof(T).Name)
                .Of(go => go.transform.SetParent(root.transform, true)).transform).RequireComponent<T>();
    }

    public static GameObject CreateGameObjectByPath(this Component root, string path)
    {
        return root?.gameObject.CreateGameObjectByPath(path);
    }

    public static void StartCoroutineAlaways(this MonoBehaviour mono, IEnumerator routine)
    {
        // #if UNITY_EDITOR
        //             if (!Application.isPlaying) {
        //                 EditorCoroutineUtility.StartCoroutineOwnerless(routine);
        //                 return;
        //             }
        // #endif
        if (Application.isPlaying) mono.StartCoroutine(routine);
    }

    public static GameObject CreateGameObjectByPath(this GameObject root, string path)
    {
        var current = root?.transform;
        foreach (var name in path.Trim('/').Split('/').Select(t => t.Trim()).Where(t => !t.IsNullOrWhitespace()))
            current = current?.Find(name) ?? new GameObject(name).transform.Of(t1 => {
                t1.SetParent(current, true);
                t1.localRotation = Quaternion.identity;
                t1.localScale = Vector3.one;
                t1.localPosition = Vector3.zero;
            });

        return current?.gameObject;
    }

    public static T A<T>(T aValue)
    {
        if ((aValue is Object obj && !obj) || aValue == null) return default;

        return aValue;
    }
}
