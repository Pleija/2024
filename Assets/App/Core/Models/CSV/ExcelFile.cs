#region
using System.IO;
using Sirenix.OdinInspector;

#if UNITY_EDITOR
using UnityEditor.AssetImporters;

#endif
using UnityEngine;
#endregion

namespace Models.CSV
{
#if UNITY_EDITOR
    [ScriptedImporter(1, new[] { "xlsx" })]
    public class ExcelImporter : ScriptedImporter
    {
        public override void OnImportAsset(AssetImportContext ctx)
        {
            var subAsset = ScriptableObject.CreateInstance<ExcelFile>();
            subAsset.assetPath = ctx.assetPath;
            subAsset.content = File.ReadAllText(ctx.assetPath).ToBase64();
            ctx.AddObjectToAsset("text", subAsset);
            ctx.SetMainObject(subAsset);
        }
    }
#endif

    public class ExcelFile : SerializedScriptableObject
    {
        public string assetPath;
        public string content;
    }
}
