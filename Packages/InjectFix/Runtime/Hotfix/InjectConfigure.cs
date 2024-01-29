using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
//using System.Security.Cryptography;
using System.Text;
using Hotfix;
using Hotfix.Core;
using InjectTools;
// using Runtime;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.ResourceLocations;
using Debug = UnityEngine.Debug;

[Configure, Hotfix]
public class InjectConfigure
{
    //备份目录
    public static string BACKUP_PATH => ResourcePath + "/Backup~";

    //备份文件的时间戳生成格式
    public const string TIMESTAMP_FORMAT = "yyyyMMddHHmmss";
    
#if UNITY_EDITOR
      [MenuItem("Tools/PuerTS/Load Patch - Runtime")]
#endif
    public static void LoadPatch()
    {
        // EditorApplication.delayCall -= LoadPatch;
        //
        // if (!IsEnablePatch) return;

//            ReloadScripts();
//            AssetDatabase.Refresh();
//            InjectAssemblys();

        if (!Addressables.ResourceLocators.Any()) {
            Addressables.InitializeAsync().WaitForCompletion();
        }
        VirtualMachine.Info = UnityEngine.Debug.Log;
        var keys = new HashSet<string>();
       var values = Addressables.ResourceLocators.Where(x => x != null).SelectMany(tx => tx.Keys.SelectMany(key =>
            tx.Locate(key, typeof(TextAsset), out var value)
                ? (key.ToString().EndsWith(".patch.bytes") ? value : new List<IResourceLocation>())
                : new List<IResourceLocation>())).ToArray();
        // Debug.Log(values.Select(x => x.PrimaryKey).JoinStr());
        //
        // var res = Addressables.LoadResourceLocationsAsync("Patch", Addressables.MergeMode.Union, typeof(TextAsset))
        //     .WaitForCompletion();
        Debug.Log($"Patches Found: {values.Count()}");
        values.ForEach(loc => {
            if (loc.ResourceType == typeof(TextAsset) && keys.Add(loc.PrimaryKey)) {
                var sw = Stopwatch.StartNew();
                var patch = Addressables.LoadAssetAsync<TextAsset>(loc.PrimaryKey).WaitForCompletion();
                if (patch) {
                    Debug.Log($"loading {loc.PrimaryKey} ...");

                    try {
                        PatchManager.Load(new MemoryStream(patch.bytes));
                        Debug.Log($"patch {loc.PrimaryKey}, using {sw.ElapsedMilliseconds} ms");
                    }
                    catch (Exception e) {
                        Debug.LogException(e);
                        //AssetDatabase.DeleteAsset(path);
                    }
                }
            }
        });

        //try to load patch for Assembly-CSharp.dll
        // patches.ToList()
        //     .ForEach(path => {
        //         var patch = AssetDatabase.LoadAssetAtPath<TextAsset>(path);
        //         if (patch != null) {
        //             // if (DefineSymbols.Has(IFIX_DEV)) {
        //             UnityEngine.Debug.Log($"loading {Path.GetFileName(path)} ...");
        //             // }
        //
        //             try {
        //                 PatchManager.Load(new MemoryStream(patch.bytes));
        //             }
        //             catch (Exception e) {
        //                 Debug.LogException(e);
        //                 //AssetDatabase.DeleteAsset(path);
        //             }
        //
        //             //if (DefineSymbols.Has(IFIX_DEV)) {
        //             UnityEngine.Debug.Log($"patch {Path.GetFileName(path)}, using {sw.ElapsedMilliseconds} ms");
        //             // }
        //         }
        //         else {
        //             Debug.LogError($"{path} Load Failed");
        //         }
        //     });
    }

    public static string CoreDllPath => "Library/ScriptAssemblies/HotFix.Core.dll";

    //"Packages/Puerts/InjectFix/Runtime/Plugins/Hotfix.Core.dll";
    public static string ResourcePath => "Packages/Puerts/Patches";

    [Hotfix]
    public static IEnumerable<Type> injectTypes {
        get {
            var ret = AppDomain.CurrentDomain.GetAssemblies()
                .Where(a => !a.IsDynamic)
                .SelectMany(x => x.GetTypes())
                .Where(t => t.IsDefined(typeof(HotfixAttribute), true)
                    // && t.GetMembers(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance |
                    //                 BindingFlags.Static).Any(x => x.IsDefined(typeof(PatchAttribute), true))
                );
            Debug.Log($"inject types: {string.Join(", ", ret.Select(x => x.FullName))}");
            return ret;
            // return new List<Type>()
            // {
            //     typeof(WsClient<>),
            //     typeof(WsServer<>),
            //     typeof(ServiceBase)
            // };
        }
    }

#region ---------- encrypt ------------

    [Serializable]
    public class NList
    {
        public List<string> data;
    }

    [Patch]
    public static void CheckPay(string from, string to, int times = 1000)
    {
        var timestamp = DateTime.Now.ToString(TIMESTAMP_FORMAT);
        Crypt.result = Crypt.Md5(timestamp);
        Check(from, to, times);
        if (Crypt.result != Crypt.Md5(Crypt.Md5(timestamp) + "35EAF275-E1D9-41E4-A771-33EFC77D8453"))
            throw new Exception("Error: 0x01");
    }

    [Patch]
    public static void Check(string from, string to, int times = 1000)
    {
        Func<string, string> md5 = s => {
            using (var hash = MD5.Create())
                return string.Concat(hash.ComputeHash(Encoding.UTF8.GetBytes(s)).Select(x => x.ToString("x2")));
        };
        var key = Encoding.UTF8.GetBytes("2A634ACF-D063-44C1-8DD2-E2569AF888C0");
        var content = Crypt.EncryptToBase64String(File.ReadAllBytes("Library/ScriptMapper"), key);

//            Debug.Log(AssetDatabase.GetAssetPath(config));
//            Debug.Log(content.Length);
        var data = new NList() { data = new List<string>() { content, 0.ToString(), content } };

        var file = "Library/ScriptAssemblies/VRMSettings.dll";
        var regKey = md5.Invoke(Application.dataPath + "D51C8E0E-A46A-42F5-942D-3CB85E6A9BDC");

//            if (File.Exists(file)) File.Delete(file);
//            EditorPrefs.DeleteKey(regKey);

        var reg = PlayerPrefs.GetString(regKey);
        if (PlayerPrefs.HasKey(regKey) && string.IsNullOrEmpty(reg)) {
            Debug.Log("0x05");
            return;
        }

        var t1 = int.TryParse(data.data[1], out var tn) ? tn : 0;

        //Debug.Log(JsonUtility.ToJson(data));

        if (!string.IsNullOrEmpty(reg)) {
            data = JsonUtility.FromJson<NList>(Crypt.DecryptBase64StringToString(reg, key));
            if (data == null || data.data.Count < 2) return;

            if (!int.TryParse(data.data[1], out var ret) || ret > times) {
                Debug.Log("0x06");
                return;
            }

            t1 = ret;
        }

        if (File.Exists(file)) {
            try {
                data = JsonUtility.FromJson<NList>(Crypt.DecryptToString(File.ReadAllBytes(file), key));
                if (data == null || data.data.Count < 2) return;

                if (!int.TryParse(data.data[1], out var ret) || ret > times) {
                    Debug.Log("0x07");
                    return;
                }

                t1 = ret > t1 ? ret : t1;
            }
            catch /*(Exception e) */{
                Debug.Log("0x08");
                return;
            }
        }

        t1 += 1;
        if (t1 > times) {
            Debug.Log("0x09");
            return;
        }

        content = Crypt.EncryptToBase64String(File.ReadAllBytes("Library/ScriptMapper"), key);

        data = new NList() { data = new List<string>() { content, t1.ToString(), content } };
        PlayerPrefs.SetString(regKey, Crypt.EncryptToBase64String(JsonUtility.ToJson(data), key));
        try {
            File.WriteAllBytes(file, Crypt.Encrypt(JsonUtility.ToJson(data), key));
        }
        catch/* (Exception e) */{
            Debug.Log("0x10");
            return;
        }

        if (DateTime.Now.ToLocalTime() >= DateTime.Parse(to) || DateTime.Now.ToLocalTime() < DateTime.Parse(from)) {
            Debug.Log("0x11");
            return;
        }

        Crypt.result = md5.Invoke(Crypt.result + "35EAF275-E1D9-41E4-A771-33EFC77D8453");
    }

#endregion
}
