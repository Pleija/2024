using System;
using System.Linq;
using Sirenix.Utilities;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEngine;

namespace Data
{
    [AttributeUsage(AttributeTargets.Class)]
    public class PreloadSettingAttribute : Attribute
    {
        public static bool Inited;
        #if UNITY_EDITOR

        // [InitializeOnLoadMethod]
        // static void SetFirst()
        // {
        //     EditorSceneManager.sceneOpened += (scene, mode) => {
        //         if (!Inited) {
        //             Inited = true;
        //         }
        //     };
        // }

        // /// <summary>
        // /// Raises the initialize on load method event.
        // /// </summary>
        // [InitializeOnLoadMethod]
        // static void OnInitializeOnLoadMethod()
        // {
        //     //EditorApplication.delayCall += () => Valid();
        //     GlobalHandle.instance.runner[typeof(PreloadSettingAttribute)] = Valid;
        // }
        [MenuItem("Tools/更新 Preloads")]
        [InitializeOnLoadMethod]
        [DidReloadScripts]
        static void Valid() {
            //if (!Inited) return;

            // if (EditorApplication.isUpdating || EditorApplication.isCompiling || Core.isBuilding) {
            //     return;
            // }

            //if(SceneManager.GetActiveScene())
            AppDomain.CurrentDomain.GetAssemblies().Where(a => !a.IsDynamic && !string.IsNullOrEmpty(a.Location)
                /* && a.GetName().Name == "Assembly-CSharp"*/).SelectMany(a => a.GetExportedTypes()).Where(type =>
                type.IsDefined(typeof(PreloadSettingAttribute), true) || (!(type.IsAbstract || type.IsGenericType)
                    && typeof(TableBase).IsAssignableFrom(type) && type.IsPublic && type != typeof(TableBase)
                    && type != typeof(ScriptableObject))).ForEach(type => {
                //Debug.Log(type.FullName);
                if (Core.FindOrCreatePreloadAsset(type) is TableBase tableBase) tableBase.Init();
            });
        }
        #endif
    }
}
