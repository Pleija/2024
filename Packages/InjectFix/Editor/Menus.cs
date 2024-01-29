using System;
// using FbxConvert;
using Hotfix;
using Hotfix.LiveDotNet;
using IFix;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEngine;

namespace InjectFix.Helpers
{
    public class Menus : UnityEditor.Editor
    {
        public const string k_Main = "Tools/Hotfix";
        public const string k_Menu = k_Main ;
        const string k_Test = "Debug/";

       // [DidReloadScripts]
        [MenuItem(k_Main + "/Patch", false, 1)]
        static void AutoPatch()
        {
            // try {
            //     if (EditorFix.IsEnablePatch)
                    EditorFix.Patch();
            // }
            // catch (Exception e) {
            //     Debug.LogException(e);
            // }
        }

        [MenuItem(k_Main + "/Enable Patch", true, -1)]
        static bool ValidateEnablePatch()
        {
            Menu.SetChecked(k_Main + "/Enable Patch", EditorPrefs.GetBool(EditorFix.k_EnablePatch, false));
            return true;
        }

        [MenuItem(k_Main + "/Enable Patch", false, -1)]
        static void EnablePatch()
        {
            var isChecked = !Menu.GetChecked(k_Main + "/Enable Patch");
            Menu.SetChecked(k_Main + "/Enable Patch", isChecked);

            // Save to EditorPrefs.
            EditorPrefs.SetBool(EditorFix.k_EnablePatch, isChecked);
            if (isChecked) {
                EditorFix.Patch();
                EditorFix.LoadPatch();
            }
            //EditorPrefs.SetBool(k_EnablePatch, !EditorPrefs.GetBool(k_EnablePatch));
        }

        [MenuItem(k_Menu + "/Patch(Android)", false, 3)]
        public static void CompileToAndroid() => EditorFix.CompileToAndroid();

        [MenuItem(k_Menu + "/Patch(IOS)", false, 4)]
        public static void CompileToIOS() => EditorFix.CompileToIOS();

        [MenuItem(k_Main + "/Inject", false, 2)]
        public static void InjectAssemblys() => EditorFix.InjectAssemblys();

        [MenuItem(k_Menu + "/Reload Scripts")]
        public static void ReloadScripts() => EditorFix.ReloadScripts();

        [MenuItem(k_Main + "/Load Patch") /*, InitializeOnLoadMethod, DidReloadScripts*/]
        public static void LoadPatch() => EditorFix.LoadPatch();

        [MenuItem(k_Menu + "/Test All")]
        static void TestAll() => EditorFix.TestAll();

        // [MenuItem(k_Test + "Test Export All")]
        // public static async void TestExportAll() => Package.TestExportAll();
        //
        // [MenuItem(k_Test + "ScreenShot")]
        // public static void TestScreenShot() => Package.TestScreenShot();
        //
        // [MenuItem(k_Test + "Shape Proxy")]
        // public static void TestShapeProxy() => Package.TestShapeProxy();

        [MenuItem(k_Menu + "/Live")]
        public static void OpenWindow() => LiveHotfix.OpenWindow();
    }
}