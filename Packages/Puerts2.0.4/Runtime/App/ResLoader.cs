using System.Collections.Generic;
using System.IO;
using System.Linq;
using App;
using Models;
using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;
using Xxtea;

namespace Puerts
{
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

        public bool FileExists(string filepath)
        {
#if UNITY_EDITOR
            if (File.Exists($"{root}/{filepath}")) {
                return true;
            }
#endif
            var pathToUse = PathToUse(filepath);
            var exist =
                ((Application.isEditor || Debug.isDebugBuild) &&
                    !string.IsNullOrEmpty(RedisData.Database.StringGet($"{root}/{filepath}"))) ||
                Cache.TryGetValue(filepath, out var result) || assets.Any(x => x.path == $"{root}/{filepath}") ||
                Res.Exists<TextAsset>($"{root}/{filepath}") != null ||
                Res.Exists<TextAsset>($"Assets/Res/proto/{filepath}") != null || Resources.Load<TextAsset>(pathToUse);
            return exist;
        }

        public readonly Dictionary<string, string> Cache = new Dictionary<string, string>();

        public string ReadFile(string filepath, out string debugPath)
        {
            debugPath = Path.GetFullPath(Path.Combine(root, filepath));
            TextAsset file = null;
#if UNITY_EDITOR
            if (File.Exists($"{root}/{filepath}")) {
                file = AssetDatabase.LoadAssetAtPath<TextAsset>($"{root}/{filepath}");
            }
#endif

            if (file == null && (Application.isEditor || Debug.isDebugBuild)) {
                var content = RedisData.Database.StringGet($"{root}/{filepath}");

                if (!string.IsNullOrEmpty(content)) {
                    return content;
                }
            }

            if (Cache.TryGetValue(filepath, out var result)) {
                return result;
            }
            file ??= assets.FirstOrDefault(x => x.path == $"{root}/{filepath}")?.file;

            if (!file) {
                if (Res.Exists<TextAsset>($"{root}/{filepath}") is { } loc) {
                    file = Addressables.LoadAssetAsync<TextAsset>(loc.PrimaryKey).WaitForCompletion();
                }
                else if (Res.Exists<TextAsset>($"Assets/Res/proto/{filepath}") is { } location) {
                    file = Addressables.LoadAssetAsync<TextAsset>(location.PrimaryKey).WaitForCompletion();
                }
            }
            file ??= Resources.Load<TextAsset>(PathToUse(filepath));

            if (file && (Path.GetExtension(filepath) == ".proto" || Path.GetExtension(filepath) == ".mjs") &&
                file.text.IsBase64()) {
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
}
