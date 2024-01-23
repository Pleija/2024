using System.IO;
using Sirenix.OdinInspector;
using UnityEngine;

namespace Models.CSV
{
#if UNITY_EDITOR
    using UnityEditor.AssetImporters;

    [ScriptedImporter(1, new[] { "tsv" })]
    public class CsvImporter : ScriptedImporter
    {
        public override void OnImportAsset(AssetImportContext ctx)
        {
            var subAsset = ScriptableObject.CreateInstance<CsvFile>();
            subAsset.assetPath = ctx.assetPath;
            subAsset.content = File.ReadAllText(ctx.assetPath).ToBase64();
            ctx.AddObjectToAsset("text", subAsset);
            ctx.SetMainObject(subAsset);
        }
    }
#endif

    public class CsvFile : SerializedScriptableObject
    {
        public string assetPath;
        public string content;
    }
}
