using System;
using System.Linq;
using System.Reflection;
using JetBrains.Annotations;
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.AssetImporters;
#endif
using UnityEngine;

public class MtsFile : ScriptableObject
{
    [NotNull]
    public string moduleName => assetPath.Split(new[] { "src/" }, StringSplitOptions.None).Last();

    [NotNull]
    public string assetPath = "";
}

#if UNITY_EDITOR
[ScriptedImporter(1, "mts")]
public class ProtoImporter : ScriptedImporter
{
    public override void OnImportAsset(AssetImportContext ctx)
    {
        //var content = XXTEA.EncryptToBase64String(File.ReadAllText(ctx.assetPath)) ;
        //var content = File.ReadAllText(ctx.assetPath).ToBase64();
        MtsFile subAsset = ScriptableObject.CreateInstance<MtsFile>();
        subAsset.assetPath = assetPath;
        var icon = AssetDatabase.LoadAssetAtPath<Texture2D>(
            "Assets/Design/UI/GUI Mobile Hyper-Casual/Sprites/Items PSD + PNG/Mushroom/Mushroom.psd");
        // typeof(EditorGUIUtility).GetMethod("SetIconForObject", BindingFlags.NonPublic | BindingFlags.Static)
        //    ?.Invoke(null, new object[] { subAsset, icon });
        var editorGUIUtilityType = typeof(EditorGUIUtility);
        var bindingFlags = BindingFlags.InvokeMethod | BindingFlags.Static | BindingFlags.NonPublic;
        var args = new object[] { subAsset, icon };
        editorGUIUtilityType.InvokeMember("SetIconForObject", bindingFlags, null, null, args);
        ctx.AddObjectToAsset("asset", subAsset);
        ctx.SetMainObject(subAsset);
    }
}

#endif
