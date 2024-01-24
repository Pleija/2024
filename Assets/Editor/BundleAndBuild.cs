#region
using MS.Shell.Editor;
using UnityEditor;
#endregion

public class BundleAndBuild
{
    [MenuItem("Tests/Build with Bundle/Build")]
    private static void Build() { }

    [MenuItem("Tests/Build with Bundle/Build and Run")]
    private static void BuildAndRun() { }

    [MenuItem("Tests/Shell Test")]
    private static void TestShell()
    {
        EditorShell.GitUpdate();
        // var operation = EditorShell.Execute("art git update 2>&1", new EditorShell.Options() {
        //     workDirectory = "Packages/HostedData",
        //     encoding = System.Text.Encoding.UTF8,
        //     environmentVars = new Dictionary<string, string>() {
        //         { "PATH", "/usr/bin:/usr/local/bin" },
        //     }
        // });
        // operation.onExit += (exitCode) => {
        //     Debug.Log("finish");
        // };
        // operation.onLog += (EditorShell.LogType LogType, string log) => {
        //     Debug.Log(log);
        // };

        //int exitCode = await operation; //support async/await
    }
}
