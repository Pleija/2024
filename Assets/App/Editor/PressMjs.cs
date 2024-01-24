#region
using System.IO;
using System.Linq;
using Models;
using Puerts;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;
#endregion

public class PressMjs : AssetPostprocessor
{
    private static bool ready;
    private static string[] files;

    public static void OnPostprocessAllAssets(string[] importedAssets, string[] deletedAssets,
        string[] movedAssets, string[] movedFromAssetPaths)
    {
        if (EditorApplication.isCompiling) return;
        files = importedAssets.Where(x => x.EndsWith(".mjs") && x.StartsWith("Assets/Res/dist"))
                .ToArray();
        if (files.Any()) EditorApplication.delayCall += Push;
    }

    [InitializeOnLoadMethod]
    private static void Setup()
    {
        EditorApplication.delayCall += () => ready = true;
    }

    private static void Push()
    {
        EditorApplication.delayCall -= Push;
        JsEnv.SafeDispose();
        files.ForEach(path => {
            Redis.Database.StringSet(path, File.ReadAllText(path));
        });
        Debug.Log(
            $"Pressed JS: {files.Length} {string.Join(", ", files.Select(Path.GetFileName))}");
        Redis.Publish("js", $"update js file(s): {files.Length}");
    }
}
