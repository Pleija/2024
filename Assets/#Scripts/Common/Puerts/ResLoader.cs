using System.Collections.Generic;
using System.IO;
using System.Linq;
using Models;
using Puerts;
using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;

public class ResLoader : ILoader, IModuleChecker
{
    public static List<JsMain.Item> assets = JsMain.self.scripts;

    //new Dictionary<string, TextAsset>();
    public static string root = "Assets/Res/dist";
    public ResLoader() { }
    //public ResLoader(string root) => ResLoader.root = root;

    public string PathToUse(string filepath)
    {
        return filepath.EndsWith(".cjs") || filepath.EndsWith(".mjs") ? filepath.Substring(0, filepath.Length - 4)
            : filepath;
    }

    public string AssetPath(string filepath) =>
        filepath.EndsWith(".proto") ? $"Assets/Res/proto/{filepath}" : $"{root}/{filepath}";

    public bool FileExists(string filepath)
    {
        var assetPath = AssetPath(filepath);
#if UNITY_EDITOR
        if (File.Exists(assetPath)) {
            return true;
        }
#endif
        var pathToUse = PathToUse(filepath);
        var exist =
            ((Application.isEditor || Debug.isDebugBuild) &&
                !string.IsNullOrEmpty(Redis.Database.StringGet(assetPath))) ||
            Cache.TryGetValue(filepath, out var result) || assets.Any(x => x.path == assetPath) ||
            Res.Exists<TextAsset>(assetPath) != null || Resources.Load<TextAsset>(pathToUse);
        return exist;
    }

    public readonly Dictionary<string, string> Cache = new Dictionary<string, string>();

    public string ReadFile(string filepath, out string debugPath)
    {
        var assetPath = AssetPath(filepath);
        debugPath = Path.GetFullPath(assetPath);
        TextAsset file = null;
#if UNITY_EDITOR
        if (File.Exists(assetPath)) {
            file = AssetDatabase.LoadAssetAtPath<TextAsset>(assetPath);
        }
#endif

        if (file == null && (Application.isEditor || Debug.isDebugBuild)) {
            var content = Redis.Database.StringGet(assetPath);

            if (!string.IsNullOrEmpty(content)) {
                return content;
            }
        }

        if (Cache.TryGetValue(filepath, out var result)) {
            return result;
        }
        file ??= assets.FirstOrDefault(x => x.path == assetPath)?.file;

        if (!file) {
            if (Res.Exists<TextAsset>(assetPath) is { } loc) {
                file = Addressables.LoadAssetAsync<TextAsset>(loc.PrimaryKey).WaitForCompletion();
            }
            // else if (Res.Exists<TextAsset>($"Assets/Res/proto/{filepath}") is { } location) {
            //     file = Addressables.LoadAssetAsync<TextAsset>(location.PrimaryKey).WaitForCompletion();
            // }
        }
        file ??= Resources.Load<TextAsset>(PathToUse(filepath));

        if (file && file.text.IsBase64()) {
            return Cache[filepath] = file.text.FromBase64();
            //XXTEA.DecryptBase64StringToString(file.text);
        }
        return file == null ? null : Cache[filepath] = file.text;
    }

    public bool IsESM(string filepath)
    {
        return filepath.Length >= 4 && !filepath.EndsWith(".cjs");
    }
}