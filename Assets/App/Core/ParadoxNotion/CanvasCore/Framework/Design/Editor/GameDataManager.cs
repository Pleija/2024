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
using TreeEditor;
using UnityEditor;
using UnityEditor.IMGUI.Controls;
using UnityEngine;
using UnityEngine.Assertions;
using EditorConfig = Models.EditorConfig;
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
        private SimpleTreeView m_TreeView;
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
        public string[] sampleTree = {
            "Animals/Mammals/Tiger",
            "Animals/Mammals/Elephant",
            "Animals/Mammals/Okapi",
            "Animals/Mammals/Armadillo",
            "Animals/Reptiles/Crocodile",
            "Animals/Reptiles/Lizard",
        };

        //[SerializeField, OdinSerialize]
        // public Dictionary<string, (string guid, string desc, int levels)> treeData =>
        //    treeData ??=
        //         new Dictionary<string, (string guid, string desc, int levels)>();
        public static List<EditorConfig.TreeItem> treeData => EditorConfig.self.treeData;

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
            if (!treeData.Any()) {
                sampleTree.OrderBy(t => t)
                    .ForEach(x => {
                        var itemName = "";
                        var arr = x.Split('/');

                        for (int i = 0; i < arr.Length; i++) {
                            itemName += i == 0 ? arr[i] : "/" + arr[i];
                            if (treeData.FirstOrDefault(s => s.key == itemName) == null)
                                treeData.Add(new EditorConfig.TreeItem() {
                                    key = itemName,
                                    guid = Guid.NewGuid().ToString(),
                                });
                        }
                    });
                EditorConfig.self.SetDirtyAndSave();
            }

            //}
            m_TreeView = new SimpleTreeView(m_TreeViewState);
            m_TreeView.OnSelectionChange += ids => {
                var select = ids.Last();
                var item = m_TreeView.caches.FirstOrDefault(x => x.Key.id == select).Value;

                if (item != null && lastKey != item.key) {
                    //Debug.Log($"select: {item}");
                    lastKey = item.key;
                    editKey = lastKey.Split('/').Last();
                }
            };
            m_TreeView.ExpandAll();
        }

        [SerializeField]
        private string lastKey;

        [SerializeField]
        private string editKey;

        private bool ready;

        protected override void OnGUI()
        {
            if (this == null || EditorApplication.isUpdating || EditorApplication.isCompiling)
                return;
            ready = true;
            base.OnGUI();
            if (Math.Abs(oldWith - MenuWidth) > float.Epsilon) TreeWidth = oldWith = MenuWidth;

            // if (m_SimpleTreeView.GetSelection().Any()) {
            //
            // }
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
            editKey ??= "";
            lastKey ??= "";

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
                    GUI.enabled = editKey != lastKey.Split('/').Last() && !editKey.IsNullOrEmpty();

                    if (GUILayout.Button("Add", EditorStyles.miniButtonLeft)) { }

                    if (GUILayout.Button("Add Child", EditorStyles.miniButtonMid)) { }
                    GUI.enabled = editKey == lastKey.Split('/').Last() && !editKey.IsNullOrEmpty();

                    if (GUILayout.Button("Del", EditorStyles.miniButtonRight)) { }
                    GUI.enabled = true;
                    GUILayout.EndHorizontal();
                    GUILayout.BeginHorizontal();

                    // if (editKey.IsNullOrEmpty() && !lastKey.IsNullOrEmpty()) {
                    //     editKey = lastKey.Split('/').Last();
                    // }
                    editKey = GUILayout.TextField(editKey);

                    if (treeData.FirstOrDefault(x =>
                        x.key == lastKey) is { } val) {
                        var levels = EditorGUILayout.IntField(val.levels, GUILayout.Width(30));

                        if (levels != val.levels) {
                            val.levels = levels;
                            //treeData[lastKey] = val;
                            EditorConfig.self.Set(t => val.levels = levels);
                            val.item.displayName = val.itemName;
                        }
                    }
                    GUILayout.EndHorizontal();
                    var rect = EditorGUILayout.BeginVertical(GUILayout.ExpandHeight(true));
                    m_TreeView.OnGUI(rect /*new Rect(0,30,200,330)*/);
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
            showAlternatingRowBackgrounds = true; //隔行显示颜色
            showBorder = false;                    //表格边框
            Reload();
        }

        public Dictionary<TreeViewItem, EditorConfig.TreeItem> caches;

        protected override TreeViewItem BuildRoot()
        {
            // 每次调用 Reload 时都调用 BuildRoot，从而确保使用数据
            // 创建 TreeViewItem。此处，我们将创建固定的一组项。在真实示例中，
            // 应将数据模型传入 TreeView 以及从模型创建的项。

            // 此部分说明 ID 应该是唯一的。根项的深度
            // 必须为 -1，其余项的深度在此基础上递增。
            var root = new TreeViewItem { id = 0, depth = -1, displayName = "Root" };
            var allItems = new List<TreeViewItem>();
            caches = new Dictionary<TreeViewItem, EditorConfig.TreeItem>();
            EditorConfig.self.treeData.ForEach((x, i) => {
                x.item = new TreeViewItem() {
                    id = i,
                    depth = x.key.Split('/').Length - 1,
                    displayName = x.itemName
                };
                caches[x.item] = x;
                allItems.Add(x.item);
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
            Debug.Log("reload?");

            //返回树的根
            return root;
        }

        protected override bool CanRename(TreeViewItem item)
        {
            item.displayName = caches[item].itemEditName;
            return true;
            // Rect renameRect = GetRenameRect(treeViewRect, 0, item);
            // return renameRect.width > 150;
        }

        protected override bool CanStartDrag(CanStartDragArgs args)
        {
            return true;
        }

        private List<int> dragItems;
        string k_GenericDragId => GetType().Name;

        protected override void SetupDragAndDrop(SetupDragAndDropArgs args)
        {
            dragItems = args.draggedItemIDs.ToList();
            //SetSelection(dragItems);
            DragAndDrop.PrepareStartDrag();
            var draggedRows =
                GetRows().Where(item => args.draggedItemIDs.Contains(item.id)).ToList();
            DragAndDrop.SetGenericData(k_GenericDragId, draggedRows);
            DragAndDrop.objectReferences =
                new UnityEngine.Object[] { }; // this IS required for dragging to work
            string title = draggedRows.Count == 1 ? draggedRows[0].displayName : "< Multiple >";
            DragAndDrop.StartDrag(title);
        }

        public Action<IList<int>> OnSelectionChange;

        protected override void SelectionChanged(IList<int> selectedIds)
        {
            OnSelectionChange?.Invoke(selectedIds);
        }

        public List<EditorConfig.TreeItem> data => EditorConfig.self.treeData;
        List<EditorConfig.TreeItem> selects = new List<EditorConfig.TreeItem>();

        protected override DragAndDropVisualMode HandleDragAndDrop(DragAndDropArgs args)
        {
            if (args.performDrop) {
                //var insert = caches.FirstOrDefault(x => x.Key.id == args.insertAtIndex).Key;
                var draggedRows =
                    GetRows().Where(item => dragItems.Contains(item.id)).ToList();
                var items = caches.Where(x => draggedRows.Contains(x.Key)).Select(x => x.Value);
                selects.Clear();

                void Press(Action<EditorConfig.TreeItem> action)
                {
                    items.ForEach(item => {
                        var key = item.key;
                        data.Remove(item);
                        action.Invoke(item);
                        selects.Add(item);
                        data.ToList()
                            .Where(x => x.key.StartsWith(key + "/"))
                            .Reverse()
                            .ForEach(x => {
                                x.key = x.key.Replace(key, item.key);
                                data.Remove(x);
                                var index = data.IndexOf(item);

                                if (index == data.Count - 1) {
                                    data.Add(x);
                                }
                                else {
                                    data.Insert(index + 1, x);
                                }
                            });
                    });
                }

                switch (args.dragAndDropPosition) {
                    case DragAndDropPosition.BetweenItems:
                        Debug.Log(@$"between: parent: {args.parentItem?.displayName} insert: {
                            args.insertAtIndex} ");

                        if (args.parentItem == rootItem) {
                            Press(x => {
                                x.key = x.key.Split('/').Last();
                                data.Insert(0, x);
                            });
                        }
                        else if (args.parentItem is { } parentItem && args.insertAtIndex != -1) {
                            var id = args.parentItem.id + args.insertAtIndex + 1;
                            var ctx = data.FirstOrDefault(x => x.item.id == id);
                            Press(x => {
                                x.key = caches[parentItem].key + "/" + x.key.Split('/').Last();

                                if (ctx == null) {
                                    data.Add(x);
                                    return;
                                }
                                var index = data.IndexOf(ctx);

                                if (index > -1) {
                                    data.Insert(index, x);
                                }
                            });
                        }
                        else {
                            return DragAndDropVisualMode.None;
                        }
                        break;
                    case DragAndDropPosition.UponItem:
                        Debug.Log($"upon: {args.parentItem?.displayName}");

                        if (args.parentItem is { } item) {
                            Press(x => {
                                x.key = caches[item].key + "/" + x.key.Split('/').Last();
                                var index = data.IndexOf(caches[item]);
                                if (index == data.Count - 1)
                                    data.Add(x);
                                else
                                    data.Insert(index + 1, x);
                            });
                        }
                        break;
                    case DragAndDropPosition.OutsideItems:
                        Debug.Log($"outside: insert id: {args.insertAtIndex}");
                        Press(x => {
                            x.key = x.key.Split('/').Last();
                            data.Add(x);
                        });
                        break;
                }
                EditorConfig.self.SetDirtyAndSave();
                Reload();
                ExpandAll();
                var ids = selects.Select(x => x.item.id).ToList();
                SetSelection(ids);
                SelectionChanged(ids);
                //OnSelectionChange?.Invoke(ids);

            }
            return DragAndDropVisualMode.Move;
        }

        protected override void RenameEnded(RenameEndedArgs args)
        {
            Debug.Log($"RenameEnded: itemID: {args.itemID}, {args.originalName} => {args.newName}");
            var item = caches.FirstOrDefault(x => x.Key.id == args.itemID).Key;

            if (!args.acceptedRename || args.newName.IsNullOrEmpty()) {
                item.displayName = caches[item].itemName;
                Reload();
                return;
            }
            //var value = treeData[item];
            var treeItem = caches[item];
            var key = treeItem.key;
            // item.displayName =
            //     args.newName + (value.levels > 0 ? $" ({value.levels})" : "");
            var t = treeItem.key.Split('/');
            t[t.Length - 1] = args.newName;
            var newKey = string.Join("/", t);
            EditorConfig.self.Set(x => {
                x.treeData
                    .Where(s => s == treeItem || s.key.StartsWith(key + "/"))
                    .ForEach(k => {
                        k.key = k.key.Replace(key, newKey);
                    });
            });
            item.displayName = treeItem.itemName;
            Reload();
        }
    }
}

#endif
