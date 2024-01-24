#region
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEngine;
#endregion

/// <summary>
///     Remove empty folders automatically.
/// </summary>
public class RemoveEmptyFolders : UnityEditor.AssetModificationProcessor
{
    public const string kMenuText = "Assets/Remove Empty Folders";
    private static readonly StringBuilder s_Log = new StringBuilder();
    private static readonly List<DirectoryInfo> s_Results = new List<DirectoryInfo>();

    /// <summary>
    ///     Raises the initialize on load method event.
    /// </summary>
    // [InitializeOnLoadMethod]
    // static void OnInitializeOnLoadMethod()
    // {
    //     EditorApplication.delayCall += () => Valid();
    // }
    [MenuItem("Assets/Clear All Empty Folder Direct")]
    public static void Clear() => __OnWillSaveAssets(new string[] { });

    /// <summary>
    ///     Raises the will save assets event.
    /// </summary>
    public static string[] __OnWillSaveAssets(string[] paths)
    {
        //Debug.Log($"check clear directory: {paths.JoinStr()}");
        // If menu is unchecked, do nothing.
        if (!EditorPrefs.GetBool(kMenuText, false)) return paths;

        // Get empty directories in Assets directory
        s_Results.Clear();
        var assetsDir = Application.dataPath + Path.DirectorySeparatorChar;
        GetEmptyDirectories(new DirectoryInfo(assetsDir), s_Results);
        GetEmptyDirectories(new DirectoryInfo(Application.dataPath + "/../Packages"), s_Results);
        var result = s_Results.Where(x =>
                        !paths.Contains(
                            x.FullName.Replace(Directory.GetCurrentDirectory() + "/", "")
                            + ".meta"))
                .ToArray();

        // When empty directories has detected, remove the directory.
        if (0 < result.Length) {
            s_Log.Length = 0;
            s_Log.AppendFormat("Remove {0} empty directories as following:\n", result.Length);

            foreach (var d in result) {
                s_Log.AppendFormat("- {0}\n", d.FullName.Replace(assetsDir, "Assets/"));
                FileUtil.DeleteFileOrDirectory(d.FullName);

                try {
                    FileUtil.DeleteFileOrDirectory(d.Parent + "\\" + d.Name + ".meta");
                    // unity 2020.2 need to delete the meta too
                }
                catch (Exception e) {
                    Debug.LogException(e);
                }
            }

            // UNITY BUG: Debug.Log can not set about more than 15000 characters.
            s_Log.Length = Mathf.Min(s_Log.Length, 15000);
            Debug.Log(s_Log.ToString());
            s_Log.Length = 0;
            //AssetDatabase.Refresh();
        }
        return paths;
    }

    /// <summary>
    ///     Toggles the menu.
    /// </summary>
    [MenuItem(kMenuText)]
    private static void OnClickMenu()
    {
        // Check/Uncheck menu.
        var isChecked = !Menu.GetChecked(kMenuText);
        Menu.SetChecked(kMenuText, isChecked);

        // Save to EditorPrefs.
        EditorPrefs.SetBool(kMenuText, isChecked);
        __OnWillSaveAssets(new string[] { });
    }

    [MenuItem(kMenuText, true)]
    private static bool Valid()
    {
        // Check/Uncheck menu from EditorPrefs.
        Menu.SetChecked(kMenuText, EditorPrefs.GetBool(kMenuText, false));
        return true;
    }

    /// <summary>
    ///     Get empty directories.
    /// </summary>
    private static bool GetEmptyDirectories(DirectoryInfo dir, List<DirectoryInfo> results)
    {
        var isEmpty = true;

        if (dir.FullName.EndsWith("~") && File.Exists(dir.FullName + ".meta")) {
            FileUtil.DeleteFileOrDirectory(dir.FullName + ".meta");
            Debug.Log($"Delete: {dir.Name}");
        }

        try {
            isEmpty =
                    // Are sub directories empty?
                    dir.GetDirectories().Count(x => !GetEmptyDirectories(x, results)) == 0
                    // No file exist?
                    && dir.GetFiles("*.*")
                            .All(x => x.Extension == ".meta" || x.Name == ".DS_Store");
        }
        catch {
            //
        }

        // Store empty directory to results.
        if (isEmpty) results.Add(dir);
        return isEmpty;
    }
}
