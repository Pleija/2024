using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection.Emit;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using Extensions;
using Puerts;
using Sirenix.Utilities;

#if UNITY_EDITOR


using UnityEditor;
using UnityEditor.AddressableAssets;
using UnityEditor.AddressableAssets.Build.DataBuilders;
using UnityEditor.Callbacks;
#endif
using UnityEngine;
using Debug = UnityEngine.Debug;
using Object = UnityEngine.Object;

[assembly: InternalsVisibleTo("Assembly-CSharp-firstpass")]
//[assembly: InternalsVisibleTo("Kernel.Runtime")]

public static partial class Core
{
    public const string BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    public const string BASE52 = "0123456789BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz";
    public const string BASE56 = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
    public const string BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    public const string BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    public const string BASE94 =
        "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

    public static byte[] FromBuffer(this ArrayBuffer buffer)
    {
        return buffer.Bytes;
    }

#if UNITY_EDITOR
     [MenuItem("Tests/Git Current Tag")]
    // [PostProcessScene(10)]
    // [InitializeOnLoadMethod]
    static void TestCurrentTag()
    {
        if (Application.isPlaying) return;

        //if (EditorApplication.isPlayingOrWillChangePlaymode) {
        var version = DateTime.Now.ToString("yyyy") + "." + RunWsl("git describe --tags --abbrev=0");
        if (PlayerSettings.bundleVersion != version && Regex.IsMatch(version, @"^[\d\.]+$")) {
            PlayerSettings.bundleVersion = version;
            if (PlayerSettings.bundleVersion == version) {
                PlayerSettings.Android.bundleVersionCode += 1;
                PlayerSettings.iOS.buildNumber = (int.Parse(PlayerSettings.iOS.buildNumber) + 1).ToString();
                Debug.Log($"version updated: {version}");
                AssetDatabase.SaveAssets();
            }
        }

        // }
    }
#endif
    public static string RunWsl(string command, string dir = default)
    {
        try {
            var file = "wsl.exe";
            var isWin = true;
#if !UNITY_EDITOR_WIN
            isWin = false;
            var sp = command.Split(new[] { ' ' }, 2);
            file = sp[0];
            command = sp[1];
#endif
            var ps = new ProcessStartInfo(file);
            if (!Strings.IsNullOrEmpty(dir)) ps.WorkingDirectory = dir ?? ""; // "ServerData";

            Debug.Log($"cmd: {command} dir:{dir}");
            ps.Arguments = isWin ? $"{command} 2>&1" : command;
            ps.CreateNoWindow = true;
            ps.UseShellExecute = false;
            ps.RedirectStandardOutput = true;
            ps.RedirectStandardError = true;

            //ps.StandardOutputEncoding = Encoding.Unicode;
            using (var p = new Process()) {
                p.StartInfo = ps;
                p.EnableRaisingEvents = true;
                var result = "";
                p.OutputDataReceived += (s, e) => {
                    result += e.Data + "\n";
                    if (!Strings.IsNullOrEmpty($"{e.Data}")) Debug.Log(e.Data);
                };

                //                        p.ErrorDataReceived += (s,e) => {
                //                            if(e.Data != null) Debug.Log(e.Data);
                //                        };
                p.Start();
                p.BeginOutputReadLine();

                //p.BeginErrorReadLine();
                var error = p.StandardError.ReadToEnd();
                if (!string.IsNullOrEmpty(error.Trim())) Debug.LogError(error);

                p.WaitForExit();

                //Debug.Log(result.Trim());
                return result.Trim();
            }
        }
        catch (Exception e) {
            Debug.LogException(e);
        }

        return null;
    }

    //        public static T AsNull<T>(this T obj, Func<T> value) where T: Object
    //        {
    //            return obj == null ? value.Invoke() : obj;
    //        }

    public static T AsNull<T>(this T obj) where T : Object
    {
        return !obj || obj == null ? null : obj;
    }

    public static bool IsUsingPackedPlayMode {
        get {
#if UNITY_EDITOR
            return AddressableAssetSettingsDefaultObject.Settings.ActivePlayModeDataBuilder != null &&
                AddressableAssetSettingsDefaultObject.Settings.ActivePlayModeDataBuilder.GetType() ==
                typeof(BuildScriptPackedPlayMode);
#endif
            return false;
        }
    }

    public static bool IsUsingAssetDatabaseMode {
        get {
#if UNITY_EDITOR
            return AddressableAssetSettingsDefaultObject.Settings.ActivePlayModeDataBuilder != null &&
                AddressableAssetSettingsDefaultObject.Settings.ActivePlayModeDataBuilder.GetType() ==
                typeof(BuildScriptFastMode);
#endif
            return false;
        }
    }

    public static string CallInfo()
    {
        var stack = new StackTrace(true);
        var i = 1;
        var tMethod = stack.GetFrame(i).GetMethod();
        while (tMethod.Name == "MoveNext" ||
            tMethod.DeclaringType.GetNiceFullName().Contains("System.Runtime.CompilerServices"))
            tMethod = stack.GetFrame(i += 1).GetMethod();

        var tPath = stack.GetFrame(i).GetFileName();
        var tLine = stack.GetFrame(i).GetFileLineNumber() + ":" + stack.GetFrame(i).GetFileColumnNumber();
        return $"{tPath}({tLine}): {tMethod.DeclaringType?.GetNiceFullName()}.{tMethod.GetNiceName()}";

        //			if (tMethod.Name == "MoveNext") {
        //				//tMethod = stack.GetFrame(2).GetMethod();
        //				return stack.GetFrames()?.Select(aFrame =>
        //					$"{aFrame.GetMethod().DeclaringType.GetNiceFullName()}.{aFrame.GetMethod().Name}").JoinStr("\n");
        //			}

        return $"{tMethod.DeclaringType.GetNiceFullName()}.{tMethod.Name}";
    }

    public static string CurrentMethod()
    {
        var stack = new StackTrace(false);
        var i = 1;
        var tMethod = stack.GetFrame(i).GetMethod();
        while (tMethod.Name == "MoveNext" ||
            tMethod.DeclaringType.GetNiceFullName().Contains("System.Runtime.CompilerServices"))
            tMethod = stack.GetFrame(i += 1).GetMethod();

        //			if (tMethod.Name == "MoveNext") {
        //				//tMethod = stack.GetFrame(2).GetMethod();
        //				return stack.GetFrames()?.Select(aFrame =>
        //					$"{aFrame.GetMethod().DeclaringType.GetNiceFullName()}.{aFrame.GetMethod().Name}").JoinStr("\n");
        //			}

        return $"{tMethod.DeclaringType.GetNiceFullName()}.{tMethod.Name}";
    }

    public static void Pause(bool aPause = true)
    {
#if UNITY_EDITOR
        Debug.Log("Paused");
        EditorApplication.isPaused = aPause;
#endif
    }

    public static T FindAssetInEditor<T>(string prefix = null) where T : Object
    {
#if UNITY_EDITOR
        return AssetDatabase.FindAssets($"t:{typeof(T).FullName} {prefix}".Trim())
            .Select(AssetDatabase.GUIDToAssetPath).Select(AssetDatabase.LoadAssetAtPath<T>).FirstOrDefault();
#endif
        return null;
    }

    public static void TimeScalePause(bool pause = true)
    {
        Debug.Log("Paused");
#if UNITY_EDITOR
        Time.timeScale = pause ? 0 : 1;
#endif
    }

    //        public static bool IsPrefabScene()
    //        {
    //        #if UNITY_EDITOR
    //            return PrefabStageUtility.GetCurrentPrefabStage() != null;
    //        #endif
    //            return false;
    //        }

    //    #if UNITY_EDITOR
    //        public static EditorWindow GetMainGameView()
    //        {
    //            System.Reflection.Assembly assembly = typeof( UnityEditor.EditorWindow ).Assembly;
    //            Type type = assembly.GetType("UnityEditor.GameView");
    //            EditorWindow gameview = EditorWindow.GetWindow(type);
    //
    //            return gameview;
    //        }
    //    #endif

    //        public static void ShowNotice( string test, Object target = null )
    //        {
    //        #if UNITY_EDITOR
    //            GetMainGameView().ShowNotification(new GUIContent(test));
    //            EditorWindow.GetWindow<SceneView>().ShowNotification(new GUIContent(test));
    //        #endif
    //            Debug.Log($"[notice] {test}".ToYellow(), target);
    //        }

    //        public static string NewGuid() => Guid.NewGuid().ToString("N");

    // [MenuItem("Components/TestFindAssembly")]
    public static IEnumerable<Type> FindTypes(Expression<Func<Type, bool>> predicate)
    {
        return from assembly in AppDomain.CurrentDomain.GetAssemblies()
                .Where(a => !(a.ManifestModule is ModuleBuilder))
            from type in assembly.GetExportedTypes().Where(predicate.Compile())
            select type;
    }

    //        public static bool isBuilding {
    //            get {
    //                return isBuilding;
    //            }
    //            set {
    //                isBuilding = value;
    //            }
    //        }
}
