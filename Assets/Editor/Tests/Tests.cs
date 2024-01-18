using System.Linq;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;

namespace Tests
{
    public class Tests
    {
        [MenuItem("Debug/Find Mts")]
        static void TestFindMtsFile()
        {
            var files = AssetDatabase.FindAssets($"t:MtsFile").Select(AssetDatabase.GUIDToAssetPath)
                .Where(x => x.StartsWith("Packages/tsproj/src/"));
            Debug.Log(string.Join(", ",files));
        }

        [MenuItem("Debug/Test Addressables Exist")]
        static void TestExists()
        {
            var t = Res.Exists("JsMain");
            Debug.Log(t.GetType().GetNiceFullName());
        }
    }
}
