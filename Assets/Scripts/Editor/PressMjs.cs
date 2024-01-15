using System.IO;
using System.Linq;
using App;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;

public class PressMjs : AssetPostprocessor
{
    private static bool ready;

    [InitializeOnLoadMethod]
    static void Setup()
    {
        EditorApplication.delayCall += () => ready = true;
    }

    public static void OnPostprocessAllAssets(string[] importedAssets, string[] deletedAssets, string[] movedAssets,
        string[] movedFromAssetPaths)
    {
        if ( EditorApplication.isCompiling) return;
        var files = importedAssets.Where(x => x.EndsWith(".mjs") && x.StartsWith("Assets/Res/dist")).ToArray();
        files.ForEach(path => {
            RedisData.self.Data(t => t.StringSet(path, File.ReadAllText(path)));
        });

        if (files.Any()) {
            Debug.Log($"Pressed JS: {files.Length} {string.Join(", ", files.Select(Path.GetFileName))}");
            RedisData.self.Redis(t => t.GetSubscriber().Publish("js", files.Length));
        }
    }
}
