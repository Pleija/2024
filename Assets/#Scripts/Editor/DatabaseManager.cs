#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Editors;
using NodeCanvas.Framework;
using Sirenix.OdinInspector.Editor;
using Sirenix.Utilities;
using Sirenix.Utilities.Editor;
using SqlCipher4Unity3D;
using UnityEditor;
using UnityEngine;
using UnityEngine.UIElements;

public class DatabaseManager : OdinMenuEditorWindow
{
    private static readonly HashSet<Type> ScriptableObjectTypes = new HashSet<Type>(
        AssemblyUtilities.GetTypes(AssemblyTypeFlags.CustomTypes).Where(t =>
            t.IsClass && !t.IsAbstract && typeof(ModelBase).IsAssignableFrom(t) &&
            t != typeof(ModelBase) && !t.IsGenericType &&
            !typeof(EditorWindow).IsAssignableFrom(t) && !typeof(Editor).IsAssignableFrom(t)));
    //.ToHashSet();

    [MenuItem("Tools/Database Manager", priority = -10001)]
    private static void ShowDialog()
    {
        var path = "Assets";
        var obj = Selection.activeObject;

        if (obj && AssetDatabase.Contains(obj)) {
            path = AssetDatabase.GetAssetPath(obj);
            if (!Directory.Exists(path)) path = Path.GetDirectoryName(path);
        }
        var window = GetWindow<DatabaseManager>();
        window.Show();
        window.position = GUIHelper.GetEditorWindowRect().AlignCenter(800, 500);
        window.titleContent = new GUIContent("Database");
        window.targetFolder = path.Trim('/');
    }

    private ScriptableObject previewObject;
    private string targetFolder;
    private Vector2 scroll;

    private Type SelectedType {
        get {
            var m = MenuTree.Selection.LastOrDefault();
            return m == null ? null : m.Value as Type;
        }
    }

    protected override OdinMenuTree BuildMenuTree()
    {
        MenuWidth = 270;
        WindowPadding = Vector4.zero;
        var tree = new OdinMenuTree(false);
        tree.Config.DrawSearchToolbar = true;
        tree.DefaultMenuStyle = OdinMenuStyle.TreeViewStyle;
        var assets = AssetDatabase.FindAssets($"t:{nameof(AssetBlackboard)}").Select(x =>
            AssetDatabase.LoadAssetAtPath<AssetBlackboard>(AssetDatabase.GUIDToAssetPath(x)));
        //tree.AddRange(ScriptableObjectTypes.Where(x => !x.IsAbstract), GetMenuPathForType);
        tree.AddRange(assets, x => {
            var path = AssetDatabase.GetAssetPath(x);
            return Path.GetDirectoryName(path)!.Replace("/", " : ") + "/" +
                Path.GetFileNameWithoutExtension(path);
        });
        tree.SortMenuItemsByName();
        tree.Selection.SelectionConfirmed += x => CreateAsset();
        tree.Selection.SelectionChanged += e => {
            // if(previewObject && !AssetDatabase.Contains(previewObject))
            //     DestroyImmediate(previewObject);
            if (e != SelectionChangedType.ItemAdded) return;
            var m = MenuTree.Selection.LastOrDefault();
            previewObject = m?.Value as AssetBlackboard;

            // var t = SelectedType;
            // if (t != null && !t.IsAbstract)
            //     previewObject = t.GetProperty("self",
            //             BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)!
            //         .GetValue(null, null) as ScriptableObject; //CreateInstance(t) as ScriptableObject;
        };
        return tree;
    }

    private string GetMenuPathForType(Type t)
    {
        var path = "";
        if (t.Namespace != null)
            foreach (var part in t.Namespace.Split('.'))
                path += part.SplitPascalCase() + "/";
        return path + t.Name.SplitPascalCase();
    }

    protected override IEnumerable<object> GetTargets()
    {
        yield return previewObject;
    }

    protected override void DrawEditor(int index)
    {
        if (previewObject)
            GUILayout.Box(AssetDatabase.GetAssetPath(previewObject), GUILayout.ExpandWidth(true));
        scroll = GUILayout.BeginScrollView(scroll);
        {
            var myStyle = new GUIStyle();
            myStyle.margin = new RectOffset(10, 10, 10, 10);
            GUILayout.BeginVertical(myStyle);
            base.DrawEditor(index);
            GUILayout.EndVertical();
        }
        GUILayout.EndScrollView();

        if (previewObject) {
            GUILayout.FlexibleSpace();
            SirenixEditorGUI.HorizontalLineSeparator(1);
            GUILayout.BeginHorizontal();
            if (GUILayout.Button("Select", GUILayoutOptions.Height(30)))
                AssetDatabase.OpenAsset(previewObject);
            if (GUILayout.Button("Create Asset", GUILayoutOptions.Height(30))) CreateAsset();
            GUILayout.EndHorizontal();
        }
    }

    private void CreateAsset()
    {
        if (previewObject) {
            var dest = targetFolder + "/" + MenuTree.Selection.First().Name + ".asset";
            dest = AssetDatabase.GenerateUniqueAssetPath(dest);
            ProjectWindowUtil.CreateAsset(previewObject, dest);
            EditorApplication.delayCall += Close;
        }
    }
}

#endif
