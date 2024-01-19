using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using Models;
using MS.Shell.Editor;
using ParadoxNotion.Design;
using Puerts;
using UnityEditor;
using UnityEditor.AddressableAssets;
using UnityEditor.AddressableAssets.Build;
using UnityEditor.AddressableAssets.Settings;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace UnityToolbarExtender
{
    [InitializeOnLoad]
    public class SceneSwitchLeftButton
    {
        static SceneSwitchLeftButton()
        {
            ToolbarExtender.RightToolbarGUI.Add(OnToolbarGUI);
        }

        private static bool newBuild = false;
        private static bool isWin;
        private static bool isAndroid;
        private static string appName;

        public static string PreExport()
        {
            if (!JsMain.PressPreload()) {
                return "JsMain Not Found";
            }

            if (newBuild) {
                UnityEngine.Debug.Log("BuildAddressablesProcessor.PreExport start");
                AddressableAssetSettings.CleanPlayerContent(AddressableAssetSettingsDefaultObject.Settings
                    .ActivePlayerDataBuilder);
                //AddressableAssetSettings.BuildPlayerContent();
                AddressableAssetSettings.BuildPlayerContent(out var rst);
                UnityEngine.Debug.Log("BuildAddressablesProcessor.PreExport done");
                return rst.Error;
            }
            var ret = UpdateBuild();
            return ret.Error;
        }

        static AddressablesPlayerBuildResult UpdateBuild()
        {
            string contentStateDataPath = ContentUpdateScript.GetContentStateDataPath(false);

            if (!File.Exists(contentStateDataPath)) {
                throw new Exception("Previous Content State Data missing");
            }
            AddressableAssetSettings settings = AddressableAssetSettingsDefaultObject.Settings;
            // List<AddressableAssetEntry> modifiedEntries = ContentUpdateScript.GatherModifiedEntries(settings, contentStateDataPath);
            // ContentUpdateScript.CreateContentUpdateGroup(settings, modifiedEntries, "Content_Update");
            return ContentUpdateScript.BuildContentUpdate(settings, contentStateDataPath);
        }

        static void BuildOSX()
        {
            EditorSceneManager.SaveOpenScenes();
            //SceneHelper.StartScene("Assets/ToolbarExtender/Example/Scenes/Scene1.unity");
            var options = new BuildPlayerOptions {
                scenes = EditorBuildSettings.scenes.Where(x => x.enabled).Select(x => x.path).ToArray(),
                locationPathName = isWin ? $"Builds/Win64/{Application.productName}.exe" :
                    isAndroid ? $"Builds/test.apk" : "Builds/test.app",
                target = isWin ? BuildTarget.StandaloneWindows64 :
                    isAndroid ? BuildTarget.Android : BuildTarget.StandaloneOSX,
#if UNITY_2021_1_OR_NEWER
                       options = BuildOptions.CleanBuildCache
#endif
            };
            var buildReport = BuildPipeline.BuildPlayer(options);

            if (buildReport.summary.result == BuildResult.Succeeded) {
                Run();
                // Process setup = new Process();
                //
                // if(!isAndroid) {
                //     setup.StartInfo.FileName = Directory.GetCurrentDirectory() +
                //         (isWin ? $"/Builds/Win64/{Application.productName}.exe"
                //             : "/Builds/test.app");
                //     setup.StartInfo.WindowStyle = ProcessWindowStyle.Normal;
                // }
                // else {
                //     // setup.StartInfo.FileName = Directory.GetCurrentDirectory() + $"/Builds/run.sh";
                //     // setup.StartInfo.Arguments = "test.apk";
                //     var proc = setup.StartInfo;
                //     //.FileName = $"{Directory.GetCurrentDirectory()}/Builds/run.sh";
                //     //setup.StartInfo.Arguments = $"{Directory.GetCurrentDirectory()}/Builds/test.apk";
                //     proc.FileName = "/bin/bash";
                //     proc.UseShellExecute = false;
                //     proc.WorkingDirectory = $"{Directory.GetCurrentDirectory()}/Builds";
                //     proc.Arguments = "run.sh test.apk";
                //     proc.WindowStyle = ProcessWindowStyle.Minimized;
                //     proc.CreateNoWindow = true;
                // }
                // setup.Start();
                // GUIUtility.ExitGUI();
                //Application.OpenURL("file://"+Directory.GetCurrentDirectory()+ "/Builds/test.app/Contents/MacOS/剑雪冰壶");
            }
            else {
                if (EditorUtility.DisplayDialog("Build 失败, 重新生成?", "Build 失败, 重新生成?", "确定", "取消")) {
                    BuildOSX();
                }
            }
        }

        // [MenuItem("Test/Shell")]
        // public static void TestShell()
        // {
        //     var thread = new Thread(TestShellThread);
        //     thread.Start();
        // }
        //
        // private static void TestShellThread ()
        // {
        //     Process proc = new Process();
        //     proc.StartInfo.FileName = "/bin/bash";
        //     proc.StartInfo.WorkingDirectory = Directory.GetCurrentDirectory()+"/Builds";
        //     proc.StartInfo.Arguments = "run.sh test.apk 2>&1";
        //     proc.StartInfo.CreateNoWindow = false;
        //     proc.StartInfo.UseShellExecute = false;
        //     proc.StartInfo.RedirectStandardOutput = true;
        //     proc.OutputDataReceived += new DataReceivedEventHandler((sender, e) =>
        //     {
        //         if (!string.IsNullOrEmpty(e.Data))
        //         {
        //             Debug.Log(e.Data);
        //         }
        //     });
        //     proc.Start();
        //     proc.BeginOutputReadLine();
        //     proc.WaitForExit();
        //     proc.Close();
        // }

        static void Run()
        {
            Process setup = new Process();

            if (!isAndroid) {
                setup.StartInfo.FileName = $"{Directory.GetCurrentDirectory()}/Builds/{appName}";
                setup.StartInfo.WindowStyle = ProcessWindowStyle.Normal;
                setup.Start();
            }
            else {
                var proc = setup.StartInfo;
                Debug.Log(EditorPrefs.GetString("AndroidSdkRoot"));
                Debug.Log($"{Application.unityVersion}");
                //.FileName = $"{Directory.GetCurrentDirectory()}/Builds/run.sh";
                //setup.StartInfo.Arguments = $"{Directory.GetCurrentDirectory()}/Builds/test.apk";
                proc.FileName =
                    $"/Applications/Unity/Hub/Editor/{Application.unityVersion}/PlaybackEngines/AndroidPlayer/SDK/platform-tools/adb";
                proc.UseShellExecute = false;
                proc.WorkingDirectory = $"{Directory.GetCurrentDirectory()}/Builds";
                setup.StartInfo.RedirectStandardOutput = true;
                proc.Arguments = "install -r test.apk";
                setup.Start();
                string strOutput = setup.StandardOutput.ReadToEnd();
                setup.WaitForExit();
                UnityEngine.Debug.Log(strOutput);
                proc.Arguments = $"shell am start -n {Application.identifier}/com.unity3d.player.UnityPlayerActivity";
                Debug.Log($"{setup.StartInfo.FileName} {setup.StartInfo.Arguments}");
                setup.Start();
                strOutput = setup.StandardOutput.ReadToEnd();
                setup.WaitForExit();

                // string strOutput = setup.StandardOutput.ReadToEnd(); 
                UnityEngine.Debug.Log(strOutput);
                // proc.WindowStyle = ProcessWindowStyle.Minimized;
                // proc.CreateNoWindow = true;
            }
            GUIUtility.ExitGUI();
            Debug.Log($"run {appName}");
        }
        // static AddressablesPlayerBuildResult UpdateBuild()
        // {
        //     string contentStateDataPath = ContentUpdateScript.GetContentStateDataPath(false);
        //
        //     if(!File.Exists(contentStateDataPath)) {
        //         throw new Exception("Previous Content State Data missing");
        //     }
        //     AddressableAssetSettings settings = AddressableAssetSettingsDefaultObject.Settings;
        //     // List<AddressableAssetEntry> modifiedEntries = ContentUpdateScript.GatherModifiedEntries(settings, contentStateDataPath);
        //     // ContentUpdateScript.CreateContentUpdateGroup(settings, modifiedEntries, "Content_Update");
        //     return ContentUpdateScript.BuildContentUpdate(settings, contentStateDataPath);
        // }

        static void OnToolbarGUI()
        {
            GUILayout.BeginVertical();
            GUILayout.Space(3);
            GUILayout.BeginHorizontal();
            var bk = GUI.backgroundColor;
            GUI.backgroundColor = ColorUtility.TryParseHtmlString("#bebebe", out var ret) ? ret : Color.white;
            GUIStyle buttonStyle = new GUIStyle(EditorStyles.miniButton);
            //buttonStyle.fontStyle = FontStyle.Bold;
            //buttonStyle.padding = new RectOffset(0, 0, 15, 0);
            //buttonStyle.margin = new RectOffset(0,5,20,-10);
            buttonStyle.normal.textColor = Color.black;
            buttonStyle.active.textColor = Color.yellow;
            buttonStyle.focused.textColor = Color.yellow;
            buttonStyle.hover.textColor = Color.yellow;
            isWin = EditorUserBuildSettings.activeBuildTarget == BuildTarget.StandaloneWindows64;
            isAndroid = EditorUserBuildSettings.activeBuildTarget == BuildTarget.Android;
            var tooltipText = isWin ? "Win64 Build" : isAndroid ? "Android Build" : "OSX Build";
            var buttonText = "Build";
            appName = isWin ? "Win64/" + Application.productName + ".exe" : isAndroid ? "test.apk" : "test.app";
            var btnHeight = 18f;
            var left = new GUIStyle("ButtonLeft");

            //left.margin = new RectOffset(0, 0, -5, 0);
            if (GUILayout.Button(new GUIContent("Git"), /*buttonStyle*/left, GUILayout.Height(btnHeight))) {
                if (!JsMain.PressPreload()) {
                    return;
                }
                EditorSceneManager.SaveOpenScenes();
                UpdateBuild();
                EditorShell.GitUpdate(() => {
                    RedisData.self.Redis(t => t.GetSubscriber().Publish("js", $"resource updated"));
                });
                GUIUtility.ExitGUI();
            }
            var mid = new GUIStyle("ButtonMid");

            //mid.margin = new RectOffset(0, 0, -5, 0);
            if (GUILayout.Button(new GUIContent(buttonText, $"{tooltipText}: Clean & Build Builds/{appName} "),
                    /*buttonStyle*/mid, GUILayout.Height(btnHeight))) {
                if (!string.IsNullOrEmpty(PreExport())) {
                    return;
                }
                BuildOSX();
            }

            if (GUILayout.Button(new GUIContent($"Run", $"Run Builds/{appName}"), /*buttonStyle*/mid,
                    GUILayout.Height(btnHeight))) {
                Run();

                //Application.OpenURL("file://"+Directory.GetCurrentDirectory()+ "/Builds/test.app");// /Contents/MacOS/剑雪冰壶
            }
            var right = new GUIStyle("ButtonRight");

            //right.margin = new RectOffset(0, 0, -5, 0);
            if (GUILayout.Button(new GUIContent("Update"), /*buttonStyle*/right, GUILayout.Height(btnHeight))) {
                UpdateBuild();
            }
            //GUILayout.Space(130);
            GUI.backgroundColor = bk;
            GUILayout.FlexibleSpace();
            GUILayout.EndHorizontal();
            GUILayout.EndVertical();

            // if(GUILayout.Button(new GUIContent("2", "Start Scene 2")))
            // {
            //     //SceneHelper.StartScene("Assets/ToolbarExtender/Example/Scenes/Scene2.unity");
            // }
        }
    }
}
