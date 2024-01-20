using System.IO;
using System.Linq;
using App;
using Models;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;

public class PressMjs : AssetPostprocessor
{
    private static bool ready;
    private static string[] files;

    [InitializeOnLoadMethod]
    private static void Setup()
    {
        EditorApplication.delayCall += () => ready = true;
    }

    public static void OnPostprocessAllAssets(string[] importedAssets, string[] deletedAssets, string[] movedAssets,
        string[] movedFromAssetPaths)
    {
        if (EditorApplication.isCompiling) return;
        files = importedAssets.Where(x => x.EndsWith(".mjs") && x.StartsWith("Assets/Res/dist")).ToArray();
        if (files.Any()) EditorApplication.delayCall += Push;
    }

    private static void Push()
    {
        EditorApplication.delayCall -= Push;
        files.ForEach(path => {
            Redis.Database.StringSet(path, File.ReadAllText(path));
        });
        Debug.Log($"Pressed JS: {files.Length} {string.Join(", ", files.Select(Path.GetFileName))}");
        Redis.Publish("js", $"update js file(s): {files.Length}");
    }
}
