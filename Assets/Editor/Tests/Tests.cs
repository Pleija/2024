using System.Linq;
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
    }
}
