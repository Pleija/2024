using System;
using UnityEditor;
using UnityEngine;

public static partial class UnityApi
{
    public static void SetDirtyAndSave(this ScriptableObject scriptableObject)
    {
#if UNITY_EDITOR
        EditorUtility.SetDirty(scriptableObject);
        AssetDatabase.SaveAssetIfDirty(scriptableObject);
#endif
    }

    public static T Set<T>(this T obj, Action<T> action = null) where T : ScriptableObject
    {
        if (obj) {
            action?.Invoke(obj);
            obj.SetDirtyAndSave();
        }
        return obj;
    }
}
