using System.Collections.Generic;
using System.IO;
using System.Linq;
using Common;
using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;
using Xxtea;

namespace Puerts
{
    public class ResLoader : ILoader, IModuleChecker
    {
        public static Dictionary<string, TextAsset> assets = new Dictionary<string, TextAsset>();
        public static string root = "Assets/Res/dist";
        public ResLoader() { }
        //public ResLoader(string root) => ResLoader.root = root;

        public string PathToUse(string filepath)
        {
            return filepath.EndsWith(".cjs") || filepath.EndsWith(".mjs")
                ? filepath.Substring(0, filepath.Length - 4) : filepath;
        }

        public bool FileExists(string filepath)
        {
            var pathToUse = PathToUse(filepath);
            var exist = Cache.TryGetValue(filepath, out var result) ||
                assets.TryGetValue(filepath, out _) ||
                Res.Exists<TextAsset>($"{root}/{filepath}") != null ||
                Res.Exists<TextAsset>($"Assets/Res/proto/{filepath}") != null ||
                Resources.Load(pathToUse);
            return exist;
        }

        public readonly Dictionary<string, string> Cache = new Dictionary<string, string>();

        public string ReadFile(string filepath, out string debugPath)
        {
            debugPath = Path.GetFullPath(Path.Combine(root, filepath));

            if(Cache.TryGetValue(filepath, out var result)) {
                return result;
            }

            if(assets.TryGetValue(filepath, out var file) == false) {
                if(Res.Exists<TextAsset>($"{root}/{filepath}") is { } loc) {
                    file = Addressables.LoadAssetAsync<TextAsset>(loc.PrimaryKey)
                        .WaitForCompletion();
                }
                else if(Res.Exists<TextAsset>($"Assets/Res/proto/{filepath}") is { } location) {
                    file = Addressables.LoadAssetAsync<TextAsset>(location.PrimaryKey)
                        .WaitForCompletion();
                }
            }

            if(file == null) {
                file = Resources.Load<TextAsset>(PathToUse(filepath));
            }
#if UNITY_EDITOR
            if(file != null)
                debugPath = Path.GetFullPath(AssetDatabase.GetAssetPath(file));
#endif
            if(file && (Path.GetExtension(filepath) == ".proto" ||
                   Path.GetExtension(filepath) == ".mjs") && file.text.IsBase64()) {
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
