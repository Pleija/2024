#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.Experimental.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
#if UNITY_2020

#else
using UnityEditor.SceneManagement;
#endif
#endif

namespace Extensions
{
    public static class GameObjects
    {
        public static GameObject CopyFrom(this GameObject origin, GameObject target) {
            if (origin.transform.parent == null) {
                SceneManager.MoveGameObjectToScene(origin, target.scene);
                origin.SetParent(target.transform.parent);
            }

            if (target.TryGetComponent<RectTransform>(out var rt)) {
                var rectTransform = origin.RequireComponent<RectTransform>();
                new RectTransformData(rt).PushToTransform(rectTransform);
            }
            else {
                new RectTransformData(target.transform).PushToTransform(origin.transform);
            }

            return origin;
        }

        // => gameObject?.GetComponentsInParent<Transform>().Select(t => t.gameObject);
        public static IEnumerable<GameObject> GetParents(this GameObject gameObject) {
            var gos = new List<GameObject>();
            while (gameObject != null) {
                gos.Add(gameObject);
                gameObject = gameObject.transform.parent?.gameObject;
            }

            return gos;
        }

        public static IEnumerable<GameObject> GetParents(this Component component) {
            return component?.gameObject.GetParents();
        }

        #if UNITY_EDITOR
        public static string GameObjectAssetPath(this GameObject go) {
            // if (go == null || !Application.isEditor) return string.Empty;
            #if UNITY_EDITOR
            var path = PrefabUtility.IsPartOfAnyPrefab(go)
                ? PrefabUtility.GetPrefabAssetPathOfNearestInstanceRoot(go)
                : PrefabStageUtility.GetPrefabStage(go)?.assetPath;

            if (path.IsNullOrEmpty()) path = go.scene.path;

            return path;
            #endif
            return null;
        }
        #endif

        public static void SetParent(this GameObject gameObject, Transform parent) {
            gameObject.transform.SetParent(parent, true);
        }

        public static void SetParent(this GameObject gameObject, GameObject parent) {
            gameObject.transform.SetParent(parent.transform, true);
        }

        public static T AddComponentOnce<T>(this GameObject gameObject) where T : Component {
            return gameObject?.GetComponent<T>() ?? gameObject?.AddComponent<T>();
        }

        public static MonoBehaviour AddComponentOnce(this GameObject gameObject, Type type) {
            return (MonoBehaviour) (gameObject?.GetComponent(type) ?? gameObject?.AddComponent(type));
        }

        public static bool ToggleShow(this GameObject gameObject) {
            var ret = !gameObject.activeInHierarchy;
            gameObject.SetActive(ret);
            return ret;
        }

        public static void LogName(this GameObject go) {
            Debug.Log(go.name);
        }

        public static T AddComonentOnce<T>(this Transform transform) where T : Component {
            return transform?.GetComponent<T>() ?? transform?.gameObject.AddComponent<T>();
        }

        public static MonoBehaviour AddComonentOnce(this Transform transform, Type type) {
            return (MonoBehaviour) (transform?.GetComponent(type) ?? transform?.gameObject.AddComponent(type));
        }

        public static T AddComonentOnce<T>(this MonoBehaviour mb) where T : Component {
            return mb?.GetComponent<T>() ?? mb?.gameObject.AddComponent<T>();
        }

        public static MonoBehaviour AddComonentOnce(this MonoBehaviour mb, Type type) {
            return (MonoBehaviour) (mb?.GetComponent(type) ?? mb?.gameObject.AddComponent(type));
        }

        public static T AddComponentOnce<T>(this Component component) where T : Component {
            return component?.GetComponent<T>() ?? component?.gameObject.AddComponent<T>();
        }

        public static MonoBehaviour AddComponentOnce(this Component component, Type type) {
            return (MonoBehaviour) (component?.GetComponent(type) ?? component?.gameObject.AddComponent(type));
        }
    }
}
