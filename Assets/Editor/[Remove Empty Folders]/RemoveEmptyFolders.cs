using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEngine;
#pragma warning disable CS0618 // 类型或成员已过时

namespace Editors
{
    /// <summary>
    ///     Remove empty folders automatically.
    /// </summary>
    public class RemoveEmptyFolders : AssetModificationProcessor
    {
        public const string kMenuText = "Assets/Remove Empty Folders";
        private static readonly StringBuilder s_Log = new StringBuilder();
        private static readonly List<DirectoryInfo> s_Results = new List<DirectoryInfo>();

        /// <summary>
        ///     Raises the initialize on load method event.
        /// </summary>
        [InitializeOnLoadMethod]
        private static void OnInitializeOnLoadMethod()
        {
            EditorApplication.delayCall += () => Valid();
        }

        /// <summary>
        ///     Raises the will save assets event.
        /// </summary>
        private static string[] OnWillSaveAssets(string[] paths)
        {
            // If menu is unchecked, do nothing.
            if((!EditorPrefs.GetBool(kMenuText, false) && paths != null) ||
               EditorApplication.isCompiling || BuildPipeline.isBuildingPlayer) return paths;
            var assetsDir = Application.dataPath + Path.DirectorySeparatorChar;
            var cache = s_Results.ToList();
            s_Results.Clear();
            cache.ForEach(t => GetEmptyDirectories(t, s_Results));

            // When empty directories has detected, remove the directory.
            if(0 < s_Results.Count) {
                s_Log.Length = 0;
                s_Log.AppendFormat("Remove {0} empty directories as following:\n", s_Results.Count);

                foreach(var d in s_Results) {
                    s_Log.AppendFormat("- {0}\n", d.FullName.Replace(assetsDir, ""));
                    FileUtil.DeleteFileOrDirectory(d.FullName);

                    try {
                        FileUtil.DeleteFileOrDirectory(d.Parent + "\\" + d.Name +
                            ".meta"); // unity 2020.2 need to delete the meta too
                    }
                    catch(Exception e) {
                        Debug.LogException(e);
                    }
                }

                // UNITY BUG: Debug.Log can not set about more than 15000 characters.
                s_Log.Length = Mathf.Min(s_Log.Length, 15000);
                Debug.Log(s_Log.ToString());
                s_Log.Length = 0;
                //AssetDatabase.Refresh();
            }

            // Get empty directories in Assets directory
            s_Results.Clear();
            GetEmptyDirectories(new DirectoryInfo(assetsDir), s_Results);
            GetEmptyDirectories(new DirectoryInfo(Application.dataPath + "/../Packages"),
                s_Results);
            var ret = paths?.ToList() ?? Directory
                .GetFiles("Assets", "*~.meta", SearchOption.AllDirectories)
                .Union(Directory.GetFiles("Packages", "*~.meta", SearchOption.AllDirectories))
                .ToList();

            if(ret.Any(x => !string.IsNullOrEmpty(x))) {
                Debug.Log(string.Join("\n", ret));
                ret.ToList().ForEach(x => {
                    if(x.EndsWith("~.meta")) {
                        Debug.Log($"delete: {x}");
                        File.Delete(x);
                        ret.Remove(x);
                    }
                });
            }
            return ret.ToArray();
        }

        /// <summary>
        ///     Toggles the menu.
        /// </summary>
        [MenuItem(kMenuText)]
        private static void OnClickMenu()
        {
            // Check/Uncheck menu.
            var isChecked = !UnityEditor.Menu.GetChecked(kMenuText);
            UnityEditor.Menu.SetChecked(kMenuText, isChecked);

            // Save to EditorPrefs.
            EditorPrefs.SetBool(kMenuText, isChecked);
            OnWillSaveAssets(null);
        }

        [MenuItem(kMenuText, true)]
        private static bool Valid()
        {
            // Check/Uncheck menu from EditorPrefs.
            UnityEditor.Menu.SetChecked(kMenuText, EditorPrefs.GetBool(kMenuText, false));
            return true;
        }

        [MenuItem("Assets/Clear Empty Folders")]
        public static void ClearDirect()
        {
            OnWillSaveAssets(null);
            OnWillSaveAssets(null);
        }

        /// <summary>
        ///     Get empty directories.
        /// </summary>
        private static bool GetEmptyDirectories(DirectoryInfo dir, List<DirectoryInfo> results)
        {
            var isEmpty = true;

            try {
                isEmpty =
                    dir.GetDirectories().Count(x => !GetEmptyDirectories(x, results)) ==
                    0 // Are sub directories empty?
                    && dir.GetFiles("*.*").All(x =>
                        x.Extension == ".meta" || x.Name.Contains(".DS_Store")); // No file exist?
            }
            catch { }

            // Store empty directory to results.
            if(isEmpty) results.Add(dir);
            return isEmpty;
        }
    }
}
