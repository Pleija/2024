using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Enums;
using Extensions;
using Sirenix.Utilities;
using UnityEditor;
using UnityEditor.AddressableAssets;
using UnityEditor.AddressableAssets.Settings;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.AddressableAssets.ResourceLocators;
using UnityEngine.ResourceManagement.ResourceLocations;
using Object = UnityEngine.Object;

public static partial class Core
{
    public static bool IsLogAssetExists;

    public static async Task LoadAllDataAsset() {
        // todo: 启动时注入所有 Scriptableobject, 因为属性里面不能使用同步加载addressables
        {
            Debug.Log($"load labels: {Id.Settings}");
            var label = new AssetLabelReference {
                labelString = $"{Id.Settings}"
            };

            var soRes = new List<IResourceLocation>();
            Addressables.ResourceLocators.ForEach(t => {
                if (t.Locate(label, typeof(ScriptableObject), out var locations)) soRes.AddRange(locations);
            });

            foreach (var location in soRes) {
                var data = await Addressables.LoadAssetAsync<ScriptableObject>(location.PrimaryKey).Task;
                //if (data is ISetInstance obj) obj.SetInstance(data);
            }
        }
    }

    public static bool ResourceExists(out IResourceLocation res, Type type = null, params object[] keys) {
        //            var list = Addressables.LoadResourceLocationsAsync($"{key}").WaitForCompletion();
        //
        //            return list?.FirstOrDefault(t => t.ResourceType == type);
        type ??= typeof(Object);
        res = null;
        var list = new List<IResourceLocation>();
        var labelName = typeof(ScriptableObject).IsAssignableFrom(type) ? "Settings" :
            type == typeof(GameObject) ? "Prefabs" : "default";

        if (!keys.Any())
            keys = new object[] {
                type.Name + (typeof(ScriptableObject).IsAssignableFrom(type) ? ".asset" :
                    type == typeof(GameObject) ? ".prefab" : "")
            };

        keys.Append(new AssetLabelReference() {
            labelString = labelName
        });

        keys.Where(t => !Strings.IsNullOrEmpty(Path.GetExtension($"{t}")))
            .ForEach(t => keys.Append(Path.ChangeExtension(t.ToString(), "").Trim('.')));

        foreach (var key in keys) {
            //var list = new List<IResourceLocation>();
            Addressables.ResourceLocators.ForEach(t => {
                if (t.Locate(key, type, out var res)) list.AddRange(res);
            });

            //list = Addressables.LoadResourceLocationsAsync(key).WaitForCompletion();
            if (list.Any()) {
                res = list.FirstOrDefault(t => t.ResourceType == type);
                if (res != null) {
                    if (IsLogAssetExists) Debug.Log($"{key} => {type.FullName}, {res.PrimaryKey} found");

                    break;
                }
            }
        }

        return res != null;
    }

    public static bool ResourceExists<T>(params object[] key) where T : Object {
        return ResourceExists(out _, typeof(T), key);
    }

    public static bool ResourceExists<T>(out IResourceLocation res, params object[] key) where T : Object {
        return ResourceExists(out res, typeof(T), key);
    }

    public static string GetAdress(this AssetReference assetReference) {
        //        #if UNITY_EDITOR
        //            return assetReference.editorAsset.GetAssetPath();
        //        #endif
        return Addressables.LoadResourceLocationsAsync(assetReference).WaitForCompletion()?.FirstOrDefault()
            ?.PrimaryKey;
    }

    /// <summary>
    /// https://forum.unity.com/threads/how-to-test-for-empty-assetreference.649999/
    /// How to test for empty AssetReference
    /// </summary>
    /// <param name="key"></param>
    /// <param name="result"></param>
    /// <typeparam name="T"></typeparam>
    /// <returns></returns>
    public static bool TryGetResourceLocator<T>(object key, out IResourceLocator result) {
        if (key != null)
            foreach (var resourceLocator in Addressables.ResourceLocators)
                if (resourceLocator.Locate(key, typeof(T), out _)) {
                    result = resourceLocator;
                    return true;
                }

        result = null;
        return false;
    }
#if UNITY_EDITOR
    public static AddressableAssetEntry SaveToAddressable(Object source, params object[] labels) {
        var path = AssetDatabase.GetAssetPath(source);
        var guiID = AssetDatabase.AssetPathToGUID(path);
        var group = AddressableAssetSettingsDefaultObject.Settings.FindGroup("Settings")
            ?? AddressableAssetSettingsDefaultObject.Settings.DefaultGroup;

        var entry = AddressableAssetSettingsDefaultObject.Settings.FindAssetEntry(guiID);
        if (entry == null) entry = AddressableAssetSettingsDefaultObject.Settings.CreateOrMoveEntry(guiID, group);

        entry.address = Path.GetFileName(path);
        labels.ForEach(t => entry.SetLabel($"{t}", true));
        AssetDatabase.SaveAssets();
        return entry;
    }
#endif

    public static T LoadAsset<T>(params object[] key) where T : Object {
        return (T) LoadAsset(typeof(T), out _, key);
    }

    public static T LoadAsset<T>(out string path, params object[] key) where T : Object {
        return (T) LoadAsset(typeof(T), out path, key);
    }

    public static Object LoadAsset(Type type, out string path, params object[] key) {
        var check = ResourceExists(out var src, type, key);
        path = src?.PrimaryKey;
        if (check) {
            var ret = Addressables.LoadAssetAsync<Object>(path).WaitForCompletion();
            return type.IsInstanceOfType(ret) ? Objects.AsNull(ret) : null;
        }

        Debug.Log($"{key} not exists");
        return null;
    }
}