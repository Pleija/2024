#if UNITY_EDITOR
#region
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;
#endregion

public static class Tool_RemoveMissingComponent
{
    /// <summary>
    ///     DOES :
    ///     Remove missing scripts in prefabs found at PATH, then save prefab.
    ///     Saved prefab will have no missing scripts left.
    ///     Will not mod prefabs that dont have missing scripts.
    ///     NOTE :
    ///     If prefab has another prefab#2 that is not in PATH, that prefab#2 will still have missing
    ///     scripts.
    ///     The instance of the prefab#2 in prefab will not have missing scripts (thus counted has override
    ///     of prefab#2)
    ///     HOW TO USE :
    ///     Copy code in script anywhere in project.
    ///     Set the PATH var in method <see cref="RemoveMissingScripstsInPrefabsAtPath" />.
    ///     Clik the button.
    /// </summary>
    [MenuItem("Tools/Remove MissingComponents in Prefabs at Path")]
    public static void RemoveMissingScripstsInPrefabsAtPath()
    {
        //string PATH = "Assets/Prefabs";
        EditorUtility.DisplayProgressBar("Modify Prefab", "Please wait...", 0);
        var ids = AssetDatabase.FindAssets("t:Prefab" /*, new string[] { PATH}*/);

        for (var i = 0; i < ids.Length; i++) {
            var path = AssetDatabase.GUIDToAssetPath(ids[i]);
            var prefab = AssetDatabase.LoadAssetAtPath(path, typeof(GameObject)) as GameObject;
            var instance = PrefabUtility.InstantiatePrefab(prefab) as GameObject;
            var delCount = 0;
            RecursivelyModifyPrefabChilds(instance, ref delCount);

            if (delCount > 0) {
                Debug.Log($"Removed({delCount}) on {path}", prefab);
                PrefabUtility.SaveAsPrefabAssetAndConnect(instance, path,
                    InteractionMode.AutomatedAction);
            }
            Object.DestroyImmediate(instance);
            EditorUtility.DisplayProgressBar("Modify Prefab", "Please wait...",
                i / (float)ids.Length);
        }
        EditorUtility.DisplayProgressBar("Modify Gameobjects", "Please wait...", 0);
        Remove();
        AssetDatabase.SaveAssets();
        EditorUtility.ClearProgressBar();
    }

    //[MenuItem("GameObject/Remove Missing Scripts")]
    public static void Remove()
    {
        var objs = Resources.FindObjectsOfTypeAll<GameObject>();
        var count = 0;
        objs.ForEach(x => {
            var t = GameObjectUtility.RemoveMonoBehavioursWithMissingScript(x);

            if (t > 0) {
                EditorUtility.DisplayProgressBar($"Modify Gameobjects({count})",
                    $"Removed({t}) on {x.name} as scene {x.scene.name}", count / 100f);
                Debug.Log($"Removed({t}) on {x.name} as scene {x.scene.name}", x);
            }
            count += t;
        });
        //int count = objs.Sum(GameObjectUtility.RemoveMonoBehavioursWithMissingScript);
        Debug.Log($"Removed {count} missing scripts");
    }

    private static void RecursivelyModifyPrefabChilds(GameObject obj, ref int delCount)
    {
        if (obj.transform.childCount > 0)
            for (var i = 0; i < obj.transform.childCount; i++) {
                var _childObj = obj.transform.GetChild(i).gameObject;
                RecursivelyModifyPrefabChilds(_childObj, ref delCount);
            }
        var innerDelCount = GameObjectUtility.RemoveMonoBehavioursWithMissingScript(obj);
        delCount += innerDelCount;
    }
}

#endif
