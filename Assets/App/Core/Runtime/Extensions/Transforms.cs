#if UNITY_EDITOR
#endif
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Text.RegularExpressions;
// using Runtime.AI;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;
using UnityEngine.SceneManagement;
using Object = UnityEngine.Object;

namespace Runtime.Extensions
{
    public static partial class Transforms
    {
//    #if UNITY_EDITOR
//        public static string GameObjectAssetPath( this GameObject go )
//        {
//            // if (go == null || !Application.isEditor) return string.Empty;
//        #if UNITY_EDITOR
//            var path = PrefabUtility.IsPartOfAnyPrefab(go)
//                ? PrefabUtility.GetPrefabAssetPathOfNearestInstanceRoot(go)
//                : PrefabStageUtility.GetPrefabStage(go)?.assetPath;
//
//            if (path.IsNullOrEmpty()) {
//                path = go.scene.path;
//            }
//
//            return path;
//        #endif
//            return Application.dataPath + "/../Temp";
//        }
//    #endif
        public static void Show(this GameObject gameObject) {
            gameObject?.SetActive(true);
        }

        public static void Hide(this GameObject gameObject) {
            gameObject?.SetActive(false);
        }

        public static void Toggle(this GameObject gameObject) {
            gameObject?.SetActive(!gameObject.activeInHierarchy);
        }

        public static void Show(this Component transform) {
            transform?.gameObject.SetActive(true);
        }

        public static void Hide(this Component transform) {
            transform?.gameObject.SetActive(false);
        }

        public static void Toggle(this Component transform) {
            transform?.gameObject.SetActive(!transform.gameObject.activeInHierarchy);
        }

        public static void SetGameObjectActive(this Component component, bool enable = true) {
            component?.gameObject.SetActive(enable);
        }

        public static Transform FindOrCreate(this Transform transform, string name) {
            return transform.Find(name) ?? new GameObject(name).Of(go => {
                SceneManager.MoveGameObjectToScene(go, transform.gameObject.scene);
                go.transform.SetParent(transform, true);
            }).transform;
        }

        public static GameObject FindOrCreate(this GameObject go, string name) {
            return go?.transform.FindOrCreate(name).gameObject;
        }

        public static GameObject FindOrCreateRoot(this GameObject gameObject, string name) {
            return gameObject.scene.GetRootGameObjects().FirstOrDefault(go => go.name == name)
                ?? new GameObject(name).Of(go => SceneManager.MoveGameObjectToScene(go, gameObject.scene));
        }

        /**
         * 否则x=6 会被转成x=5
         */
        public static Vector3Int ToVector3Int(this Vector3 vector3) {
            return Vector3Int.RoundToInt(vector3);
        }

        public static float X(this Component component, bool withParent = false, float x = 0f) {
            return component.transform.localPosition.x
                + (withParent ? component.transform.parent.localPosition.x + x : 0);
        }

        public static float Y(this Component component, bool withParent = false, float y = 0f) {
            return component.transform.localPosition.y
                + (withParent ? component.transform.parent.localPosition.y + y : 0);
        }

        public static float Z(this Component component, bool withParent = false, float z = 0f) {
            return component.transform.localPosition.z
                + (withParent ? component.transform.parent.localPosition.z + z : 0);
        }

        public static int IntX(this Component component, bool withParent = false, int x = 0) {
            Transform transform;
            return Vector3Int.RoundToInt(component.transform.localPosition).x
                + (withParent ? Vector3Int.RoundToInt(component.transform.parent.localPosition).x + x : 0);
        }

        public static int IntY(this Component component, bool withParent = false, int y = 0) {
            return Vector3Int.RoundToInt(component.transform.localPosition).y
                + (withParent ? Vector3Int.RoundToInt(component.transform.parent.localPosition).y + y : 0);
        }

        public static int IntZ(this Component component, bool withParent = false, int z = 0) {
            return Vector3Int.RoundToInt(component.transform.localPosition).z
                + (withParent ? Vector3Int.RoundToInt(component.transform.parent.localPosition).z + z : 0);
        }

        public static Vector3 XAdd(this Component component, float x) {
            return component.transform.localPosition += new Vector3(x, 0, 0);
        }

        public static Vector3 YAdd(this Component component, float y) {
            return component.transform.localPosition += new Vector3(0, y, 0);
        }

        public static Vector3 ZAdd(this Component component, float z) {
            return component.transform.localPosition += new Vector3(0, 0, z);
        }

        public static Vector2Int XY(this Component component, bool withParent = false, int x = 0, int y = 0) {
            return new Vector2Int(component.IntX(withParent, 0) + x, component.IntY(withParent, 0) + y);
        }

        public static Vector2Int XZ(this Component component, bool withParent = false, int x = 0, int z = 0) {
            Vector3 localPosition;
            return new Vector2Int(component.IntX(withParent, 0) + x, component.IntZ(withParent, 0) + z);
        }

        // public static Vector2Int setIntXY(this Component component,int x = 0, int y = 0, bool withParent = false)
        // {
        //     return new Vector2Int(component.getIntX(withParent)+x, component.getIntY(withParent)+y);
        // }
        //
        // public static Vector2Int setIntXZ(this Component component, bool withParent = false)
        // {
        //     Vector3 localPosition;
        //
        //     return new Vector2Int(component.getIntX(withParent), component.getIntZ(withParent));
        // }

        public static Vector3Int getvVector3Int(this Component component, bool withParent = false, int x = 0, int y = 0,
            int z = 0) {
            Vector3 localPosition;
            return new Vector3Int(component.IntX(withParent, 0) + x, component.IntY(withParent, 0) + y,
                component.IntZ(withParent, 0) + z);
        }

        public static Vector3 addVector3(this Component component, float x, float y, float z) {
            return component.transform.localPosition += new Vector3(x, y, z);
        }

        public static Vector3 addVector3(this Component component, int x, int y, int z) {
            return component.transform.localPosition += new Vector3(x, y, z);
        }

        public static Transform AlignTo(this Transform src, Transform dest, bool moveToLast = false) {
            new RectTransformData(dest).PushToTransform(src);
            if (moveToLast) src.SetAsLastSibling();

            return src;
        }

        public static RectTransform AlignTo(this RectTransform src, RectTransform dest, bool moveToLast = false) {
            new RectTransformData(dest).PushToTransform(src);
            if (moveToLast) src.SetAsLastSibling();

            return src;
        }

        public static RectTransform AlignTo(this RectTransform src, Transform dest, bool moveToLast = false) {
            return AlignTo(src, dest.GetComponent<RectTransform>(), moveToLast);
        }

        public static RectTransform AlignTo(this Transform src, RectTransform dest, bool moveToLast = false) {
            return AlignTo(src.GetComponent<RectTransform>(), dest.GetComponent<RectTransform>(), moveToLast);
        }

        public static void ClearChildTransforms(this Transform transform, Expression<Func<Transform, bool>> expr = null,
            bool directOnly = true) {
            foreach (var child in transform.Childs(expr, directOnly) /*.Where(expr?.Compile() ?? (t => true))*/)
                if (child.gameObject != null)
                    child.gameObject.DestroySelf();

            // if (Application.isPlaying) {
            //     Object.Destroy(child.gameObject);
            // } else {
            //     Object.DestroyImmediate(child.gameObject);
            // }
        }

        public static List<GameObject> ChildGameObjects(this Transform transform,
            Expression<Func<Transform, bool>> expr = null, bool directOnly = true) {
            return transform.Childs(expr, directOnly).Select(t => t.gameObject).ToList();
        }

        public static List<GameObject> ChildGameObjects(this Component component,
            Expression<Func<Transform, bool>> expr = null, bool directOnly = true) {
            return ChildGameObjects(component?.transform, expr, directOnly);
        }

        public static List<GameObject> ChildGameObjects(this GameObject gameObject,
            Expression<Func<Transform, bool>> expr = null, bool directOnly = true) {
            return ChildGameObjects(gameObject?.transform, expr, directOnly);
        }

        public static List<Transform> Childs(this GameObject gameObject, Expression<Func<Transform, bool>> expr = null,
            bool directOnly = true) {
            return Childs(gameObject?.transform, expr, directOnly);
        }

        public static List<Transform> Childs(this Component gameObject, Expression<Func<Transform, bool>> expr = null,
            bool directOnly = true) {
            return Childs(gameObject?.transform, expr, directOnly);
        }

        public static List<Transform> Childs(this Transform transform, Expression<Func<Transform, bool>> expr = null,
            bool directOnly = true) {
            var children = new List<Transform>();
            foreach (Transform child in transform)
                if (!directOnly || child.parent == transform)
                    children.Add(child);

            return children.Where(expr?.Compile() ?? (t => true)).OrderBy(t => t.GetSiblingIndex()).ToList();
        }

        // public static List<Transform> ToList(this Transform transform) => transform.Childs();
        //
        // public static void ForEach(this Transform transform, Action<Transform> action)
        // {
        //     transform.Childs().ForEach(action);
        // }

        public static string DataPathRoot(this string path) {
            path = path.Replace("\\", "/");
            if (!path.Contains(Application.dataPath))
                return Path.Combine(Path.GetDirectoryName(Application.dataPath) + "", path).Replace("\\", "/");

            return path;
        }

        public static string PregReplace(this string str, string[] rule, string to) {
            return PregReplace(str, rule, new[] { to });
        }

        public static string PregReplace(this string str, string rule, string to) {
            return PregReplace(str, new[] { rule }, new[] { to });
        }

        public static string PregReplace(this string str, string[] rule, string[] to) {
            rule.ForEach((s, i) => {
                var replace = to.Length == rule.Length ? to[i] : to[0];
                str = Regex.Replace(str, s, replace);
            });

            return str;
        }

        public static string DataPathRoot(this Object obj) {
            #if UNITY_EDITOR
            return obj == null ? string.Empty : AssetDatabase.GetAssetPath(obj)?.DataPathRoot();
            #endif
            return null;
        }

        public static string DirName(this string path, bool create = false) {
            path = Path.GetDirectoryName(path);
            if (create && !Directory.Exists(path)) Directory.CreateDirectory(path);

            return path;
        }

        public static string FileExtension(this string path) {
            return Path.GetExtension(path);
        }

        public static string ResourcePath(this Object obj) {
            return Core.A(obj)?.GetAssetPath().ResourcePath();
        }

        public static string ResourcePath(this string path) {
            var sp = path.Replace('\\', '/').Split(new[] { "Resources/" }, StringSplitOptions.None);
            var name = sp.Length > 1 ? sp[1] : sp[0];
            if (Path.HasExtension(name)) name = name.Replace(Path.GetExtension(name), "");

            return name;
        }

        public static string GetAssetPath(this Object obj) {
            #if UNITY_EDITOR
            return obj == null ? string.Empty : AssetDatabase.GetAssetPath(obj);
            #endif
            return null;
        }

        public static string CreateDirFromFilePath(this string path, bool isFile = true) {
            var dir = isFile ? Path.GetDirectoryName(path) : path;
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

            if (!Directory.Exists(dir)) throw new Exception("dir created fail");

            return path; //.dataPathRoot();
        }

        public static string GetPath(this GameObject gameObject) {
            return Core.A(gameObject) == null
                ? ""
                : string.Join("/",
                    gameObject.GetComponentsInParent<Transform>(true).Select(t => t.name).Reverse().ToArray());
        }

        public static string GetPath(this Component component) {
            return Core.A(component)?.gameObject.GetPath();
        }

        public static string GetClassPath(this Component component) {
            return Core.A(component)?.gameObject.GetClassPath();
        }

        public static string M_VarName(this string theVar, bool toCaptical = true) {
            var str = theVar.Replace("(clone)", "").Trim().Split('.').First();
            str = Regex.Replace(str, @"[ _\-\.]+", " ");
            str = Regex.Replace(str, @"[\W\d]+", "");
            if (toCaptical) str = Regex.Replace(str, @"\b[a-z]", m => m.Value.ToUpper());

            return str.Replace(" ", toCaptical ? "" : "_");
        }

        public static string GetClassPath(this GameObject gameObject) {
            return Core.A(gameObject) == null
                ? ""
                : string.Join("/",
                    gameObject.GetComponentsInParent<Transform>().Select(t => t.name.M_VarName()).Reverse().ToArray());
        }

        //public static string GetPath(this Component component) => component?.gameObject.GetPath();
    }
}
