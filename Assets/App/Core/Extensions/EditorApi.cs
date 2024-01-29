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
}
