//using Common.JSRuntime;

using System;
using System.Linq;
using Unity.GoQL;
using UnityEngine;
// #endif

// using WebSocketSharp;

public static partial class Core
{
    public static GameObject CheckTagsFromRoot(this GameObject root)
    {
        //            var names = new HashSet<string>();
        //            root?.GetComponentsInChildren<Tags>(true)?.ForEach(t => {
        //                //if (Env.forceReload || true) {
        //                t.isAwaked = false;
        //                // }
        //                if (!t.isAwaked) {
        //                    t.Awake();
        //                    t.OnEnable();
        //
        //                    //t.gameObject.AddTag(t.ids.ToArray());
        //                    t.Start();
        //                }
        //
        //                if (t.gameObject.HasTag("DontShow")) {
        //                    t.gameObject.SetActive(false);
        //                }
        //
        //                if (names.Add(t.gameObject.name) && t.tags.Any()) {
        //                    //Debug.Log($"[CheckTag] {t.gameObject.name} [ {t.tags.Join()} ]".ToBlue());
        //                }
        //            });
        //            return root;
        return null;
    }

    public static GameObject[] Query(string query)
    {
        var goql = new GoQLExecutor(query);
        GameObject[] results = goql.Execute();
        if (goql.parseResult == ParseResult.OK)
        {
            Debug.Log($"{query} Found: {results.Length}");
            return results;
        }

        return new GameObject[] { };
    }

    public static T Find<T>(params string[] q) where T : class => Find<T>(null, q);

    public static T Find<T>(GameObject parent = null, params string[] q) where T : class
    {
        GameObject gameObject = null;
        foreach (var query in q)
        {
            var str = $"{query}" + (typeof(T) == typeof(GameObject) ? "" : $"<t:{typeof(T).Name}>");
            gameObject = Query(str).FirstOrDefault(t =>
                !parent || t.GetComponentsInParent<Transform>().Contains(parent.transform));

            //                GameObject[] results = goql.Execute();
            //                if (goql.parseResult == ParseResult.OK) {
            //                    gameObject = results.FirstOrDefault(t =>
            //                        t.GetComponentsInParent<Transform>().Contains(parent.transform));
            //                }

            if (gameObject) break;
        }

        if (gameObject)
        {
            if (typeof(T) == typeof(GameObject))
            {
                return gameObject as T;
            }

            return gameObject.GetComponent<T>() ?? throw new Exception($"{q[0]} not found");
        }

        throw new Exception($"{q[0]} not found");
    }

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
}
