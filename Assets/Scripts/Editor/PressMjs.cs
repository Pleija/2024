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
        if (!ready || EditorApplication.isCompiling || EditorApplication.isUpdating) return;
        var files = importedAssets.Where(x => x.EndsWith(".mjs") && x.StartsWith("Asssets/Res/dist")).ToArray();
        files.ForEach(path => {
            RedisData.self.data.StringSet(path, File.ReadAllText(path));
        });

        if (files.Any()) {
            Debug.Log($"Pressed JS: {files.Length}\n{string.Join("\n", files.Select(Path.GetFileName))}");
            RedisData.self.redis.GetSubscriber().Publish("js", files.Length);
        }
    }
}
