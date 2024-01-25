using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NodeCanvas.Editor;
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using Sirenix.OdinInspector.Editor;
using Sirenix.Utilities;
using Sirenix.Utilities.Editor;
using SqlCipher4Unity3D;
using UnityEditor;
using UnityEditor.IMGUI.Controls;
using UnityEngine;

public class GameDataManager : OdinMenuEditorWindow
{
    private ScriptableObject previewObject;

    [MenuItem("Tools/Data Manager", priority = -10000)]
    private static void ShowDialog()
    {
        var window = GetWindow<GameDataManager>();
        window.Show();
        window.position = GUIHelper.GetEditorWindowRect().AlignCenter(800, 500);
        window.titleContent = new GUIContent("GameData");
        //window.targetFolder = path.Trim('/');
    }

    public float TreeWidth {
        get => EditorPrefs.GetFloat(GetType().Name + ":MenuWidth", MenuWidth);
        set => EditorPrefs.SetFloat(GetType().Name + ":MenuWidth", value);
    }

    protected override OdinMenuTree BuildMenuTree()
    {
        MenuWidth = TreeWidth;
        WindowPadding = Vector4.zero;
        var tree = new OdinMenuTree(false);
        tree.Config.DrawSearchToolbar = true;
        tree.DefaultMenuStyle = OdinMenuStyle.TreeViewStyle;
        var assets = AssetDatabase.FindAssets($"t:{nameof(AssetBlackboard)}")
                .Select(x => x.GuidToAssetPath().LoadAssetAtPath<AssetBlackboard>());
        //tree.AddRange(ScriptableObjectTypes.Where(x => !x.IsAbstract), GetMenuPathForType);
        tree.AddRange(assets, x => {
            var path = AssetDatabase.GetAssetPath(x);
            return Path.GetDirectoryName(path)!.Replace("Assets/", "").Replace("/", " : ")
                    + "/"
                    + Path.GetFileNameWithoutExtension(path);
        });
        tree.SortMenuItemsByName();
        tree.Selection.SelectionChanged += e => {
            if (e != SelectionChangedType.ItemAdded) return;
            var m = MenuTree.Selection.LastOrDefault();
            previewObject = m?.Value as ScriptableObject;

            if (previewObject) {
                //Selection.activeObject = previewObject;
                Debug.Log(previewObject.GetAssetPath());
            }
        };
        return tree;
    }

    private Dictionary<Graph, Editor> m_Editors = new Dictionary<Graph, Editor>();

    // SerializeField 用于确保将视图状态写入窗口
    // 布局文件。这意味着只要窗口未关闭，即使重新启动 Unity，也会保持
    // 状态。如果省略该属性，仍然会序列化/反序列化状态。
    [SerializeField]
    TreeViewState m_TreeViewState;

    //TreeView 不可序列化，因此应该通过树数据对其进行重建。
    SimpleTreeView m_SimpleTreeView;
    private int tab;

    protected override void OnEnable()
    {
        base.OnEnable();
        //检查是否已存在序列化视图状态（在程序集重新加载后
        // 仍然存在的状态）
        if (m_TreeViewState == null) m_TreeViewState = new TreeViewState();
        m_SimpleTreeView = new SimpleTreeView(m_TreeViewState);
    }

    private float oldWith;

    protected override void OnGUI()
    {
        base.OnGUI();

        if (Math.Abs(oldWith - MenuWidth) > float.Epsilon) {
            TreeWidth = oldWith = MenuWidth;
        }
        return;
        GUILayout.BeginHorizontal();
        {
            GUILayout.BeginVertical(GUILayout.Width(80));
            {
                GUILayout.Space(3);

                if (GUILayout.Button("test", GUILayout.Height(40))) { }
                GUILayout.EndVertical();
            }
            base.OnGUI();
            GUILayout.EndHorizontal();
        }
    }

    private Vector2 scrollArea;

    protected override void DrawEditor(int index)
    {
        //Debug.Log(index);
        if (!(previewObject is AssetBlackboard bb)) return;
        // if (!(m_Editors.TryGetValue(graph, out var editor) && editor)) {
        //     // var window = GetWindow<GraphEditor>(); //CreateInstance<GraphEditor>();
        //     // GraphEditor.SetReferences(graph, null, graph.blackboard);
        //     Debug.Log($"{graph.blackboard?.GetType().FullName}");
        //     editor = Editor.CreateEditor(graph);
        //     // Editor.CreateCachedEditor(window, null, ref editor);
        //     //window.Show();
        //     m_Editors[graph] = editor;
        // }
        GUILayout.BeginVertical();
        tab = GUILayout.Toolbar(tab, new string[] { "Object", "Bake", "Layers" });

        switch (tab) {
            case 0:
                GUILayout.BeginHorizontal();
                GUILayout.BeginVertical(GUILayout.Width(200));
                GUILayout.Space(5);

                if (GUILayout.Button(bb.GetAssetPath())) {
                    Selection.activeObject = bb;
                }
                //Debug.Log(rect);
                //Rect currentLayoutRect = GUIHelper.GetCurrentLayoutRect();
                var rect = EditorGUILayout.BeginVertical(GUILayout.ExpandHeight(true));
                GUILayout.Box("", GUILayout.ExpandWidth(true),
                    GUILayout.ExpandHeight(true));
                m_SimpleTreeView.OnGUI(rect /*new Rect(0,30,200,330)*/);
                EditorGUILayout.EndVertical();
                GUILayout.EndVertical();
                GUILayout.BeginVertical(GUILayout.ExpandHeight(true));

                // OdinEditor.ForceHideMonoScriptInEditor = true;
                //
                // try {
                //     editor.OnInspectorGUI();
                // }
                // finally {
                //     OdinEditor.ForceHideMonoScriptInEditor = false;
                // }
                base.DrawEditor(index);
                GUILayout.EndVertical();
                GUILayout.EndHorizontal();
                break;
            case 1:
                scrollArea = EditorGUILayout.BeginScrollView(scrollArea);
                GUILayout.BeginHorizontal();
                var variables = bb.GetVariables().ToArray();

                for (int i = 0; i < bb.LevelCount; i++) {
                    GUILayout.BeginVertical(GUILayout.MaxWidth(200));
                    variables.ForEach(t => {
                        var tVar = t as Variable;
                        GUI.backgroundColor = tVar.color == default ? Color.white : tVar.color;
                        var rect = EditorGUILayout.BeginVertical("box", GUILayout.MaxWidth(200),
                            GUILayout.ExpandWidth(false));
                        GUILayout.Label(tVar.name);
                        EditorGUI.BeginChangeCheck();
                        var value = BlackboardEditor.VariableField(bb, tVar, bb, i,
                            GUILayout.MaxWidth(150));

                        if (value != tVar[i]) {
                            UndoUtility.RecordObject(bb, "Variable Value Change");
                            tVar[i] = value;
                            UndoUtility.SetDirty(bb);
                        }

                        if (EditorGUI.EndChangeCheck()) {
                            UndoUtility.SetDirty(bb);
                        }
                        GUILayout.EndVertical();
                        GUI.backgroundColor = Color.white;
                    });
                    GUILayout.EndVertical();
                }

                // var data = bb.Data;
                // data.LevelData.ForEach(level => {
                //     GUILayout.BeginVertical(GUILayout.MaxWidth(200));
                //     {
                //         GUILayout.Label(level.Id);
                //         GUILayout.Label(level.desc);
                //         GUILayout.Label(level.Level.ToString());
                //         level.items ??= new System.Collections.Generic.List<LevelItem>();
                //         bb.GetVariables()
                //                 .Where(x =>
                //                         !level.items.Any(t =>
                //                                 t.name == x.name
                //                                 && t.variable.varType == x.varType))
                //                 .ForEach(t => {
                //                     Debug.Log($"reset: {t.name}");
                //                     level.items.RemoveAll(x => x.name == t.name);
                //                     level.items.Add(new LevelItem() {
                //                         variable = new Variable<object>() {
                //                             name = t.name,
                //                             varType = t.varType,
                //                             value = t.value
                //                         },
                //                     });
                //                 });
                //         level.items.Where(x =>
                //                         bb.Variables != null
                //                         && bb.Variables.TryGetValue(x.name, out var ret)
                //                         && ret != null
                //                         && x.name != null)
                //                 .ForEach((t, i) => {
                //                     GUI.backgroundColor =
                //                             bb.Variables[t.name].color == default
                //                                     ? Color.white
                //                                     : bb.Variables[t.name].color;
                //                     var rect = EditorGUILayout.BeginVertical("box",
                //                         GUILayout.MaxWidth(200),
                //                         GUILayout.ExpandWidth(false));
                //                     GUILayout.Label(t.name);
                //                     EditorGUI.BeginChangeCheck();
                //                     var value = BlackboardEditor.VariableField(bb,
                //                         t.variable,
                //                         bb, GUILayout.MaxWidth(150));
                //
                //                     if (value != t.variable.value) {
                //                         UndoUtility.RecordObject(bb,
                //                             "Variable Value Change");
                //                         t.variable.value = value;
                //                         UndoUtility.SetDirty(bb);
                //                     }
                //
                //                     if (EditorGUI.EndChangeCheck()) {
                //                         UndoUtility.SetDirty(bb);
                //                     }
                //                     GUILayout.EndVertical();
                //                     GUI.backgroundColor = Color.white;
                //                 });
                //         GUILayout.EndVertical();
                //     }
                // });
                GUILayout.EndHorizontal();
                EditorGUILayout.EndScrollView();

                //UndoUtility.SetDirty(bb);
                this.RepaintIfRequested();
                break;
            case 2: break;
        }
        GUILayout.EndVertical();
    }
}
