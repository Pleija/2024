using System.Linq;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Tests
{
    public class Tests
    {
        [MenuItem("Debug/Find Mts")]
        static void TestFindMtsFile()
        {
            var files = AssetDatabase.FindAssets($"t:MtsFile").Select(AssetDatabase.GUIDToAssetPath)
                .Where(x => x.StartsWith("Packages/tsproj/src/"));
            Debug.Log(string.Join(", ", files));
        }

        [MenuItem("Debug/Test Addressables Exist")]
        static void TestExists()
        {
            var t = Res.Exists("JsMain");
            Debug.Log(t.GetType().GetNiceFullName());
        }

        [MenuItem("Debug/Game/当前场景物体数量")]
        static void 当前场景物体数量()
        {
            Debug.Log(SceneManager.GetActiveScene().GetRootGameObjects()
                .SelectMany(x => x.GetComponentsInChildren<Transform>(true)).Count());
        }
    }
}
