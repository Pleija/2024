#region
using System.Linq;
using Puerts;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;
using UnityEngine.SceneManagement;
#endregion

namespace Tests
{
    public class Tests
    {
        [MenuItem("Tests/Find Mts")]
        private static void TestFindMtsFile()
        {
            var files = AssetDatabase.FindAssets("t:MtsFile")
                    .Select(AssetDatabase.GUIDToAssetPath)
                    .Where(x => x.StartsWith("Packages/tsproj/src/"));
            Debug.Log(string.Join(", ", files));
        }

        [MenuItem("Tests/Test Addressables Exist")]
        private static void TestExists()
        {
            var t = Res.Exists("JsMain");
            Debug.Log(t.GetType().GetNiceFullName());
        }

        [MenuItem("Tests/Game/当前场景物体数量")]
        private static void 当前场景物体数量()
        {
            Debug.Log(SceneManager.GetActiveScene()
                    .GetRootGameObjects()
                    .SelectMany(x => x.GetComponentsInChildren<Transform>(true))
                    .Count());
        }

        [MenuItem("Tests/JsEnv")]
        private static void TestJs()
        {
            JsEnv.Require("debug", "DevDebug");
            JsEnv.Require("debug", "say", "hello");
        }

        [MenuItem("Tests/Network")]
        private static void TestNetwork()
        {
            // Js.Require("debug", "DevDebug");
            JsEnv.Reload();
            JsEnv.Require("debug", "network");
        }
    }
}
