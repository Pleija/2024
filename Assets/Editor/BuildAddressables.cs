#region
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Models;
using MS.Shell.Editor;
using Sirenix.Utilities;
using UnityEditor;
using UnityEditor.AddressableAssets;
using UnityEditor.AddressableAssets.Build;
using UnityEditor.AddressableAssets.Settings;
using UnityEditor.SceneManagement;
using UnityEngine;
#endregion

//[AutoClearStatic]
namespace Editors
{
    internal class BuildAddressablesProcessor
    {
        private static bool newBuild = false;

        public static AddressableAssetSettings setting =>
                AddressableAssetSettingsDefaultObject.Settings;
        //[AutoClearStatic]
        // private static bool m_CanPass = true;
        // private static bool m_FirstBuild = true;

        [InitializeOnEnterPlayMode]
        private void ClearDefaults()
        {
            // m_CanPass = false;
            // m_FirstBuild = true;
        }

        private static AddressablesPlayerBuildResult UpdateBuild()
        {
            var contentStateDataPath = ContentUpdateScript.GetContentStateDataPath(false);
            if (!File.Exists(contentStateDataPath))
                throw new Exception("Previous Content State Data missing");
            var settings = AddressableAssetSettingsDefaultObject.Settings;
            // List<AddressableAssetEntry> modifiedEntries = ContentUpdateScript.GatherModifiedEntries(settings, contentStateDataPath);
            // ContentUpdateScript.CreateContentUpdateGroup(settings, modifiedEntries, "Content_Update");
            return ContentUpdateScript.BuildContentUpdate(settings, contentStateDataPath);
        }

        /// <summary>
        ///     Run a clean build before export.
        ///     todo:
        ///     https://forum.unity.com/threads/remoteproviderexception-textdataprovider-unable-to-load-assets-aa-settings-json.1152815/
        ///     todo: 必须在build 之前执行一次addressables build, 并且addressables build之后不能执行过run, 否则安卓会报catelog 404
        /// </summary>
        public static string PreExport()
        {
            if (newBuild) {
                // var version = setting.OverridePlayerVersion.Split('.');
                //     version[version.Length-1] = (int.Parse(version[version.Length-1])+1).ToString();
                //  setting.OverridePlayerVersion = string.Join(".", version);    
                Debug.Log("BuildAddressablesProcessor.PreExport start");
                AddressableAssetSettings.CleanPlayerContent(AddressableAssetSettingsDefaultObject
                        .Settings.ActivePlayerDataBuilder);
                //AddressableAssetSettings.BuildPlayerContent();
                AddressableAssetSettings.BuildPlayerContent(out var rst);
                Debug.Log("BuildAddressablesProcessor.PreExport done");
                return rst.Error;
            }
            var ret = UpdateBuild();
            return ret.Error;
        }

        [InitializeOnLoadMethod]
        private static void Initialize()
        {
            BuildPlayerWindow.RegisterBuildPlayerHandler(BuildPlayerHandler);
        }

        private static void PressMjs_old()
        {
            var extensions = new List<string> { ".mjs", ".proto" };
            var sDir = "Assets/Resources";
            var res = "Assets/Res";

            if (Directory.Exists(res) && false) {
                Directory.GetFiles(sDir, "*.*", SearchOption.AllDirectories)
                        .Where(f => extensions.IndexOf(Path.GetExtension(f)) >= 0)
                        .ForEach(file => {
                            if (Path.GetExtension(file) == ".mjs"
                                && !File.Exists($"{res}/dist{file.Replace(sDir, "")}"))
                                File.Delete(file);
                            if (Path.GetExtension(file) == ".proto"
                                && !File.Exists($"{res}/proto{file.Replace(sDir, "")}"))
                                File.Delete(file);
                        });
                Directory.GetFiles(res, "*.*", SearchOption.AllDirectories)
                        .Where(f => extensions.IndexOf(Path.GetExtension(f)) >= 0)
                        .ForEach(file => {
                            var path =
                                    $"{sDir}{file.Replace($"{res}/dist", "").Replace($"{res}/proto", "")}";
                            if (File.Exists(path)) return;
                            if (!Directory.Exists(Path.GetDirectoryName(path)))
                                Directory.CreateDirectory(Path.GetDirectoryName(path)!);
                            File.Copy(file, path);
                        });
                AssetDatabase.Refresh();
            }
        }

        private static void GitUpdate()
        {
            var operation = EditorShell.Execute("art git update 2>&1", new EditorShell.Options {
                workDirectory = "Packages/HostedData",
                encoding = Encoding.UTF8,
                environmentVars = new Dictionary<string, string>
                        { { "PATH", "/usr/bin:/usr/local/bin" } },
            });
            operation.onExit += exitCode => {
                Debug.Log("finish");
                EditorUtility.DisplayDialog("", "git finish", "ok");
            };
            operation.onLog += (LogType, log) => {
                Debug.Log(log);
            };
            // GUIUtility.ExitGUI();
        }

        private static void BuildPlayerHandler(BuildPlayerOptions options)
        {
            // if (AddressableAssetSettingsDefaultObject.Settings.IsDirty()) {
            //     FirstBuild = true;
            //     AddressableAssetSettingsDefaultObject.Settings.SaveAsset();
            // }
            //if(m_FirstBuild || !m_CanPass)
            if (!JsMain.PressPreload()) return;
            if (!EditorUtility.DisplayDialog("Build with Addressables",
                "必须在build 之前执行一次addressables build, 并且addressables build之后不能执行过run, 否则安卓会报catelog 404\n\nDo you want to build a clean addressables before export?",
                "Build with Addressables", "Cancel"))
                return;
            Setting.self.ResVersion.Value = Setting.self.ResVersion.Value.VersionAdd();
            EditorSceneManager.SaveOpenScenes();
            PreExport();
            EditorShell.GitUpdate();
            //GitUpdate();

            // if(string.IsNullOrEmpty(PreExport()))
            //     m_CanPass = true;

            // if (options.target == BuildTarget.StandaloneOSX)
            // {
            //     options.locationPathName = "Builds/test.app";
            // }

            //options.options |= BuildOptions.CleanBuildCache;
            PlayerSettings.Android.bundleVersionCode += 1;
            PlayerSettings.iOS.buildNumber =
                    (int.Parse(PlayerSettings.iOS.buildNumber) + 1).ToString();
            PlayerSettings.bundleVersion = PlayerSettings.bundleVersion.VersionAdd();
            // var version = UnityEditor.PlayerSettings.bundleVersion.Split('.');
            // version[version.Length - 1] = (int.Parse(version[version.Length - 1]) + 1).ToString();
            // UnityEditor.PlayerSettings.bundleVersion = string.Join(".", version);
            AssetDatabase.SaveAssets();
            Debug.Log($"Version: {PlayerSettings.bundleVersion} => {Application.version}");
            //BuildPlayerWindow.DefaultBuildMethods.BuildPlayer(options);
            BuildPipeline.BuildPlayer(options);

            //m_FirstBuild = false;
        }
    }
}
