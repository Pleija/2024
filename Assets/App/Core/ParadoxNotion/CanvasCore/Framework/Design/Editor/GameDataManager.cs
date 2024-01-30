#if UNITY_EDITOR

#region
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Models;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using Sirenix.OdinInspector.Editor;
using Sirenix.Serialization;
using Sirenix.Utilities;
using Sirenix.Utilities.Editor;
using SqlCipher4Unity3D;
using UnityEditor;
using UnityEditor.IMGUI.Controls;
using UnityEngine;
using UnityEngine.Assertions;
using Object = System.Object;
#endregion

namespace NodeCanvas.Editor
{
    public class GameDataManager : OdinMenuEditorWindow
    {
        // SerializeField 用于确保将视图状态写入窗口
        // 布局文件。这意味着只要窗口未关闭，即使重新启动 Unity，也会保持
        // 状态。如果省略该属性，仍然会序列化/反序列化状态。
        [SerializeField]
        private TreeViewState m_TreeViewState;

        private Dictionary<Graph, UnityEditor.Editor> m_Editors =
            new Dictionary<Graph, UnityEditor.Editor>();

        //TreeView 不可序列化，因此应该通过树数据对其进行重建。
        private SimpleTreeView m_SimpleTreeView;
        private float oldWith;
        private ScriptableObject previewObject;
        private Vector2 scrollArea;
        private int tab;

        public float TreeWidth {
            get => EditorPrefs.GetFloat(GetType().Name + ":MenuWidth", MenuWidth);
            set => EditorPrefs.SetFloat(GetType().Name + ":MenuWidth", value);
        }

        [SerializeField]
        public List<(string id, string name, string desc)> tree =
            new List<(string id, string name, string desc)>();

        [SerializeField]
        public string[] sampleTree = new[] {
            "Animals/Mammals/Tiger",
            "Animals/Mammals/Elephant",
            "Animals/Mammals/Okapi",
            "Animals/Mammals/Armadillo",
            "Animals/Reptiles/Crocodile",
            "Animals/Reptiles/Lizard",
        };

        //[SerializeField, OdinSerialize]
        // public Dictionary<string, (string guid, string desc, int levels)> treeData =>
        //     EditorConfig.self.treeData ??=
        //         new Dictionary<string, (string guid, string desc, int levels)>();

        protected override void OnEnable()
        {
            base.OnEnable();
            //检查是否已存在序列化视图状态（在程序集重新加载后
            // 仍然存在的状态）
            if (m_TreeViewState == null) m_TreeViewState = new TreeViewState();
            //tree ??= new List<(string id, string name, string desc)>();
            //treeData ??= new Dictionary<string, (string guid, string desc, int levels)>();

            //if (!treeData.Any()) {
            // new TreeViewItem { id = 1, depth = 0, displayName = "Animals" },
            // new TreeViewItem { id = 2, depth = 1, displayName = "Mammals" },
            // new TreeViewItem { id = 3, depth = 2, displayName = "Tiger" },
            // new TreeViewItem { id = 4, depth = 2, displayName = "Elephant" },
            // new TreeViewItem { id = 5, depth = 2, displayName = "Okapi" },
            // new TreeViewItem { id = 6, depth = 2, displayName = "Armadillo" },
            // new TreeViewItem { id = 7, depth = 1, displayName = "Reptiles" },
            // new TreeViewItem { id = 8, depth = 2, displayName = "Crocodile" },
            // new TreeViewItem { id = 9, depth = 2, displayName = "Lizard" },

            //tree.AddRange();
            var data = sampleTree.OrderBy(t => t);
            var dirty = false;
            data.ForEach(x => {
                var t = "";
                var arr = x.Split('/');

                for (int i = 0; i < arr.Length; i++) {
                    t += i == 0 ? arr[i] : "/" + arr[i];

                    if (!EditorConfig.self.treeData.TryGetValue(t, out var ret)) {
                        dirty = true;
                        Debug.Log($"lost: {t}");
                        EditorConfig.self.treeData[t] = (Guid.NewGuid().ToString(), "", 0);
                    }
                }
            });
            if(dirty) EditorConfig.self.SetDirtyAndSave();
            //}
            m_SimpleTreeView = new SimpleTreeView(m_TreeViewState);
            m_SimpleTreeView.ExpandAll();
        }

        private string lastKey;
        private bool ready;

        protected override void OnGUI()
        {
            if (this == null || EditorApplication.isUpdating || EditorApplication.isCompiling)
                return;

            ready = true;

            base.OnGUI();
            if (Math.Abs(oldWith - MenuWidth) > float.Epsilon) TreeWidth = oldWith = MenuWidth;

            if (m_SimpleTreeView.GetSelection().Any()) {
                var select = m_SimpleTreeView.GetSelection().Last();
                var item = m_SimpleTreeView.caches.FirstOrDefault(x => x.Value.id == select).Key;

                if (lastKey != item) {
                    Debug.Log($"select: {item}");
                    lastKey = item;
                }
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

        [MenuItem("Tools/Data Manager", priority = -10000)]
        public static void ShowDialog()
        {
            var window = GetWindow<GameDataManager>();
            window.Show();
            window.position = GUIHelper.GetEditorWindowRect().AlignCenter(800, 500);
            window.titleContent = new GUIContent("GameData");
            //window.targetFolder = path.Trim('/');
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
                if (previewObject)
                    //Selection.activeObject = previewObject;
                    Debug.Log(previewObject.GetAssetPath());
            };
            return tree;
        }

        // private Dictionary<Var, SerializedObject> objs = new Dictionary<Var, SerializedObject>();
        //
        // private Dictionary<Var, UnityEditor.Editor> editors =
        //     new Dictionary<Var, UnityEditor.Editor>();

        public static Dictionary<string, Var> editorCache { get; set; } =
            new Dictionary<string, Var>();

        protected override void DrawEditor(int index)
        {
            if (EditorApplication.isCompiling || EditorApplication.isUpdating || !ready) return;

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
            tab = GUILayout.Toolbar(tab, new[] { "Object", "Bake", "Layers" });

            switch (tab) {
                case 0:
                    GUILayout.BeginHorizontal();
                    GUILayout.BeginVertical(GUILayout.Width(200));
                    //GUILayout.Space(5);
                    //Debug.Log(rect);
                    //Rect currentLayoutRect = GUIHelper.GetCurrentLayoutRect();
                    EditorGUILayout.BeginVertical("box", GUILayout.ExpandHeight(true));
                    // GUILayout.Box("", GUILayout.ExpandWidth(true),
                    //     GUILayout.ExpandHeight(true));
                    GUILayout.BeginHorizontal();

                    if (GUILayout.Button("Add", EditorStyles.miniButtonLeft)) { }

                    if (GUILayout.Button("Edit", EditorStyles.miniButtonMid)) { }

                    if (GUILayout.Button("Del", EditorStyles.miniButtonRight)) { }
                    GUILayout.EndHorizontal();
                    GUILayout.BeginHorizontal();
                    lastKey = GUILayout.TextField(lastKey);

                    if (EditorConfig.self.treeData != null
                        && lastKey != null
                        && EditorConfig.self.treeData.TryGetValue(lastKey, out var val)) {
                        var levels = EditorGUILayout.IntField(val.levels, GUILayout.Width(30));

                        if (levels != val.levels) {
                            val.levels = levels;
                            EditorConfig.self.treeData[lastKey] = val;
                            EditorConfig.self.SetDirtyAndSave();

                            m_SimpleTreeView.caches[lastKey].displayName = lastKey.Split('/').Last()
                                + (levels > 0 ? $" ({levels})" : "");
                        }
                    }
                    GUILayout.EndHorizontal();
                    var rect = EditorGUILayout.BeginVertical(GUILayout.ExpandHeight(true));
                    m_SimpleTreeView.OnGUI(rect /*new Rect(0,30,200,330)*/);
                    EditorGUILayout.EndVertical();
                    EditorGUILayout.EndVertical();
                    GUILayout.EndVertical();
                    GUILayout.BeginVertical(GUILayout.ExpandHeight(true));
                    if (GUILayout.Button(bb.GetAssetPath())) Selection.activeObject = bb;

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
                    editorCache ??= new Dictionary<string, Var>();

                    for (var i = 0; i < bb.LevelCount; i++) {
                        GUILayout.BeginVertical(GUILayout.MaxWidth(200));

                        foreach (var tVar in variables) {
                            // if (!editorCache.TryGetValue($"{tVar.ID}:{i}", out var data)) {
                            //     data = editorCache[$"{tVar.ID}:{i}"] = DbTable.Connection
                            //         .Table<Var>()
                            //         .FirstOrInsert(x => x.index == i
                            //             && x.guid == tVar.ID
                            //             && x.tableName == bb.tableName, aVar => {
                            //             aVar.index = i;
                            //             aVar.name = tVar.name;
                            //             aVar.guid = tVar.ID;
                            //             aVar.tableName = bb.tableName;
                            //             aVar.type = tVar.varType;
                            //             aVar.value = tVar[i];
                            //         });
                            // }

                            // if (data.name != tVar.name
                            //     || data.type != tVar.varType
                            //     || data.value != tVar[i]) {
                            //     data.value = tVar[i];
                            //     data.name = tVar.name;
                            //     data.type = tVar.varType;
                            //     data.Save();
                            // }
                            GUI.backgroundColor = tVar.color == default ? Color.white : tVar.color;
                            EditorGUILayout.BeginVertical("box", GUILayout.MaxWidth(200),
                                GUILayout.ExpandWidth(false));
                            GUILayout.Label(tVar.name);
                            EditorGUI.BeginChangeCheck();
                            // if (!objs.TryGetValue(data, out var editorObj) || editorObj == null)
                            //     editorObj = new SerializedObject(data);
                            //data.value ??= tVar.value ?? data.type.CreateInstance();
                            // var oldValue = data.value;
                            // //var editor = editors.AddOrGet(data, UnityEditor.Editor.CreateEditor);
                            // EditorGUI.BeginChangeCheck();
                            // EditorGUILayout.PropertyField(editorObj.FindProperty("value"));
                            // editorObj.ApplyModifiedProperties();
                            //
                            // if (EditorGUI.EndChangeCheck() || oldValue != data.value) {
                            //
                            // }
                            var value = BlackboardEditor.VariableField(bb, tVar, bb, i,
                                GUILayout.MaxWidth(150));

                            //Assert.IsTrue(Object.ReferenceEquals(tVar[i], value),"Object.ReferenceEquals(tVar[i], value)");

                            if ( /*value != tVar[i] ||*/ EditorGUI.EndChangeCheck()) {
                                Debug.Log("===========changed=========");
                                UndoUtility.RecordObject(bb, "Variable Value Change");
                                tVar[i] = value;
                                //data.value = value;
                                //UndoUtility.SetDirty(data);
                                UndoUtility.SetDirty(bb);
                                //data.Save();
                            }
                            //if (EditorGUI.EndChangeCheck()) UndoUtility.SetDirty(bb);
                            GUILayout.EndVertical();
                            GUI.backgroundColor = Color.white;
                        }
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
                    break;
                case 2: break;
            }
            GUILayout.EndVertical();
            this.RepaintIfRequested();
        }
    }

    internal class SimpleTreeView : TreeView
    {
        //private Dictionary<string, (string guid, string desc, int levels)> items;

        public SimpleTreeView(TreeViewState treeViewState) : base(treeViewState)
        {
            //this.items = items;
            Reload();
        }

        public Dictionary<string, TreeViewItem> caches = new Dictionary<string, TreeViewItem>();

        protected override TreeViewItem BuildRoot()
        {
            // 每次调用 Reload 时都调用 BuildRoot，从而确保使用数据
            // 创建 TreeViewItem。此处，我们将创建固定的一组项。在真实示例中，
            // 应将数据模型传入 TreeView 以及从模型创建的项。

            // 此部分说明 ID 应该是唯一的。根项的深度
            // 必须为 -1，其余项的深度在此基础上递增。
            var root = new TreeViewItem { id = 0, depth = -1, displayName = "Root" };
            var allItems = new List<TreeViewItem>();
            EditorConfig.self.treeData.OrderBy(x => x.Key).ForEach((x, i) => {
                var item = new TreeViewItem() {
                    id = i,
                    depth = x.Key.Split('/').Length - 1,
                    displayName = x.Key.Split('/').Last()
                        + (x.Value.levels > 0 ? $" ({x.Value.levels})" : "")
                };
                caches[x.Key] = item;
                allItems.Add(item);
            });
            // var allItems = new List<TreeViewItem> {
            //     new TreeViewItem { id = 1, depth = 0, displayName = "Animals" },
            //     new TreeViewItem { id = 2, depth = 1, displayName = "Mammals" },
            //     new TreeViewItem { id = 3, depth = 2, displayName = "Tiger" },
            //     new TreeViewItem { id = 4, depth = 2, displayName = "Elephant" },
            //     new TreeViewItem { id = 5, depth = 2, displayName = "Okapi" },
            //     new TreeViewItem { id = 6, depth = 2, displayName = "Armadillo" },
            //     new TreeViewItem { id = 7, depth = 1, displayName = "Reptiles" },
            //     new TreeViewItem { id = 8, depth = 2, displayName = "Crocodile" },
            //     new TreeViewItem { id = 9, depth = 2, displayName = "Lizard" },
            // };

            // 用于初始化所有项的 TreeViewItem.children 和 .parent 的实用方法。
            SetupParentsAndChildrenFromDepths(root, allItems);

            //返回树的根
            return root;
        }
    }
}

#endif
