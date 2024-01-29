#if UNITY_EDITOR

using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO;
using System.Linq;
using InjectFix.Helpers;
using Hotfix.Core;
// using Runtime.Extensions;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEditor.Compilation;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace Hotfix
{
    public partial class EditorFix
    {
        // public static string k_Main => Menus.k_Main;
        // public static string k_Menu = k_Main + "/Tools";

        public const string IFIX_DEV = "IFIX_DEV";

        public static string k_EnablePatch => Application.productName + ":HotFix.EnablePatch";

        public static bool IsEnablePatch => /*!DefineSymbols.Has(IFIX_DEV) || */
            EditorPrefs.GetBool(k_EnablePatch, false);

        //[MenuItem(k_Menu+ "/Test All")]
        public static void TestAll()
        {
            Debug.Log("--------- Test All ---------");
            doRestore("");
            Patch();
        }

        //[MenuItem(k_Menu+ "/Reload Scripts")]
        public static void ReloadScripts()
        {
            EditorUtility.RequestScriptReload();
        }

        private static ConcurrentQueue<Action> _actions = new ConcurrentQueue<Action>();
        public static Action AddOnloadAction(Action action)
        {
            _actions.Enqueue(action);
            return action;
           
        }

        //[DidReloadScripts]
        static void PatchActions()
        {
            while (_actions.TryDequeue(out var action)) {
                action?.Invoke();
            }

            if (EditorPrefs.GetBool("Inject.LoadPatch.Once")) {
                EditorPrefs.DeleteKey("Inject.LoadPatch.Once");
                EditorPrefs.SetBool("Inject.LoadPatch", true);
            }

            if (EditorPrefs.GetBool("Inject.Patch.Once")) {
                EditorPrefs.DeleteKey("Inject.Patch.Once");

                Patch();
                InjectAssemblys();
                EditorPrefs.SetBool("Inject.LoadPatch.Once", true);
                CompilationPipeline.RequestScriptCompilation();
            }

            if (EditorPrefs.GetBool("Inject.LoadPatch")) {
                LoadPatch();
            }
        }

        // [MenuItem(k_Menu+ "/Load Patch") /*, InitializeOnLoadMethod, DidReloadScripts*/]
        //[DidReloadScripts]
        public static void LoadPatch() => InjectConfigure.LoadPatch();
        /*public static void LoadPatch()
        {
            // EditorApplication.delayCall -= LoadPatch;
            //
            // if (!IsEnablePatch) return;

//            ReloadScripts();
//            AssetDatabase.Refresh();
//            InjectAssemblys();
            var patches = AssetDatabase.FindAssets($"t:TextAsset .patch").Select(AssetDatabase.GUIDToAssetPath);
            // if (DefineSymbols.Has(IFIX_DEV)) {
            Debug.Log($"patches: {string.Join(", ", patches)}");
            //  }

            VirtualMachine.Info = (s) => UnityEngine.Debug.Log(s);

            //try to load patch for Assembly-CSharp.dll
            patches.ToList()
                .ForEach(path => {
                    var patch = AssetDatabase.LoadAssetAtPath<TextAsset>(path);
                    if (patch != null) {
                        // if (DefineSymbols.Has(IFIX_DEV)) {
                        UnityEngine.Debug.Log($"loading {Path.GetFileName(path)} ...");
                        // }

                        var sw = Stopwatch.StartNew();
                        try {
                            PatchManager.Load(new MemoryStream(patch.bytes));
                        }
                        catch (Exception e) {
                            Debug.LogException(e);
                            //AssetDatabase.DeleteAsset(path);
                        }

                        //if (DefineSymbols.Has(IFIX_DEV)) {
                        UnityEngine.Debug.Log($"patch {Path.GetFileName(path)}, using {sw.ElapsedMilliseconds} ms");
                        // }
                    }
                    else {
                        Debug.LogError($"{path} Load Failed");
                    }
                });
        }*/
    }
}
#endif