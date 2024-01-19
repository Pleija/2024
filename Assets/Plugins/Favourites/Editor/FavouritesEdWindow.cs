using Runtime.Favourites.Runtime;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEditor.IMGUI.Controls;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Favourites.Editor
{
    public class FavouritesEdWindow : EditorWindow
    {
        static readonly GUIContent GC_Add = new GUIContent("+", "Add category");
        static readonly GUIContent GC_Reflash = new GUIContent("R", "Reflash category");
        static readonly GUIContent GC_Remove = new GUIContent("x", "Remove selected");
        static readonly GUIContent GC_Fav = new GUIContent("Fav", "Fav List");
        public static FavouritesEdWindow instance;
        [SerializeField] [HideInInspector] FavouritesAsset asset;
        [SerializeField] [HideInInspector] TreeViewState treeViewState;
        [SerializeField] [HideInInspector] FavouritesTreeView treeView;
        [SerializeField] [HideInInspector] SearchField searchField;

        // ------------------------------------------------------------------------------------------------------------------

        [MenuItem("Window/收藏夹")]
        static void ShowWindow()
        {
            GetWindow<FavouritesEdWindow>("收藏夹").UpdateTreeview();
        }

        void OnHierarchyChange()
        {
            if (Application.isPlaying) return;
            UpdateTreeview();
        }

        void OnEnable()
        {
            instance = this;
            EditorSceneManager.sceneOpened += SceneOpened;
            EditorSceneManager.sceneClosed += SceneClosed;
            SceneManager.sceneLoaded += SceneLoaded;
            SceneManager.sceneLoaded += (arg0, mode) => UpdateTreeview();
            EditorSceneManager.sceneOpening += (path, mode) => UpdateTreeview();
            EditorApplication.delayCall += () => UpdateTreeview();
        }

        [PostProcessBuild(1)]
        public static void OnPostprocessBuild(BuildTarget target, string pathToBuiltProject)
        {
            Debug.Log(pathToBuiltProject);
            if (instance != null) instance.UpdateTreeview();
        }

        void SceneLoaded(Scene arg0, LoadSceneMode arg1)
        {
            UpdateTreeview();
        }

        void SceneClosed(Scene scene)
        {
            UpdateTreeview();
        }

        void SceneOpened(Scene scene, OpenSceneMode mode)
        {
            UpdateTreeview();
        }

        void OnProjectChange()
        {
            UpdateTreeview();
        }

        bool firstUpdate;

        public void UpdateTreeview()
        {
            if (asset == null) LoadAsset();
            if (treeViewState == null) treeViewState = new TreeViewState();

            if (treeView == null) {
                searchField = null;
                treeView = new FavouritesTreeView(treeViewState);
            }

            if (searchField == null) {
                searchField = new SearchField();
                searchField.downOrUpArrowKeyPressed += treeView.SetFocusAndEnsureSelectedItem;
            }
            treeView?.LoadAndUpdate(asset);
            Repaint();
            asset.RefleshAction = () => {
                UpdateTreeview();
            };

            if (!firstUpdate) {
                //Debug.Log("Repaint Favorites");
                firstUpdate = true;
            }
        }

        // ------------------------------------------------------------------------------------------------------------------

        protected void OnGUI()
        {
            if (treeView == null) {
                UpdateTreeview();
            }
            EditorGUILayout.BeginHorizontal(EditorStyles.toolbar);
            {
                // var index = 0;
                // var items = new[] { "#All", "Test2" };
                // index = EditorGUILayout.Popup(index, items, GUILayout.MaxWidth(80));

                // GUILayout.Space(5);
                if (GUILayout.Button(GC_Add, EditorStyles.toolbarButton, GUILayout.Width(18)))
                    TextInputWindow.ShowWindow("Favourites", "Enter category name", "", AddCategory,
                        null);
                GUI.enabled = treeView.Model.Data.Count > 0;
                if (GUILayout.Button(GC_Remove, EditorStyles.toolbarButton, GUILayout.Width(18)))
                    RemoveSelected();
                treeView.searchString =
                    searchField.OnToolbarGUI(treeView.searchString, GUILayout.ExpandWidth(true));

                if (GUILayout.Button(GC_Reflash, EditorStyles.toolbarButton, GUILayout.Width(18))) {
                    Debug.Log("Fav Reloaded");
                    UpdateTreeview();
                }
                GUI.enabled = true;
            }
            EditorGUILayout.EndHorizontal();
            treeView.OnGUI();
        }

        // ------------------------------------------------------------------------------------------------------------------

        void AddCategory(TextInputWindow wiz)
        {
            var s = wiz.Text;
            wiz.Close();
            if (string.IsNullOrEmpty(s)) return;
            AddCategory(s);
        }

        public void AddCategory(string s)
        {
            asset.AddCategory(s);
            EditorUtility.SetDirty(asset);
            Debug.Log("set dirty");
            UpdateTreeview();
            Repaint();
            Debug.Log("Repaint");
            AssetDatabase.SaveAssets();
        }

        void RemoveSelected()
        {
            var ids = treeView.GetSelection();
            if (ids.Count == 0) return;
            var ele = treeView.Model.Find(ids[0]);
            if (ele == null) return;

            if (ele.category != null) {
                // remove elements from open scene. those in closed scenes will just
                // have to stay. they will not show up anyway if category is gone

                // remove from scene
                foreach (var c in FavouritesEd.Containers) {
                    if (c == null || c.favs == null) continue;

                    for (var i = c.favs.Count - 1; i >= 0; i--)
                        if (c.favs[i].categoryId == ele.category.id) {
                            c.favs.RemoveAt(i);
                            EditorSceneManager.MarkSceneDirty(c.gameObject.scene);
                            Debug.Log("set dirty");
                        }
                }

                // remove favourites linked to this category
                for (var i = asset.favs.Count - 1; i >= 0; i--)
                    if (asset.favs[i].categoryId == ele.category.id)
                        asset.favs.RemoveAt(i);

                // remove category
                for (var i = 0; i < asset.categories.Count; i++)
                    if (asset.categories[i].id == ele.category.id) {
                        asset.categories.RemoveAt(i);
                        break;
                    }
                EditorUtility.SetDirty(asset);
                Debug.Log("set dirty");
            }
            else {
                var found = false;

                for (var i = 0; i < asset.favs.Count; i++)
                    if (asset.favs[i] == ele.fav) {
                        found = true;
                        asset.favs.RemoveAt(i);
                        EditorUtility.SetDirty(asset);
                        Debug.Log("set dirty");
                        break;
                    }

                if (!found)
                    foreach (var c in FavouritesEd.Containers) {
                        if (c == null || c.favs == null) continue;

                        for (var i = 0; i < c.favs.Count; i++)
                            if (c.favs[i] == ele.fav) {
                                found = true;
                                c.favs.RemoveAt(i);
                                EditorSceneManager.MarkSceneDirty(c.gameObject.scene);
                                Debug.Log("set dirty");
                                break;
                            }
                        if (found) break;
                    }
            }
            UpdateTreeview();
            Repaint();
            Debug.Log("Repaint");
        }

        public FavouritesAsset LoadAsset()
        {
            var guids = AssetDatabase.FindAssets("t:FavouritesAsset");
            var fn = guids.Length > 0
                ? AssetDatabase.GUIDToAssetPath(guids[0])
                : GetPackageFolder() + "FavouritesAsset.asset";
            asset = AssetDatabase.LoadAssetAtPath<FavouritesAsset>(fn);

            if (asset == null) {
                asset = CreateInstance<FavouritesAsset>();
                AssetDatabase.CreateAsset(asset, fn);
                AssetDatabase.SaveAssets();
            }
            return asset;
        }

        string GetPackageFolder()
        {
            try {
                var res = System.IO.Directory.GetFiles(Application.dataPath,
                    "FavouritesEdWindow.cs", System.IO.SearchOption.AllDirectories);
                if (res.Length > 0)
                    return "Assets" +
                           res[0]
                               .Replace(Application.dataPath, "")
                               .Replace("FavouritesEdWindow.cs", "")
                               .Replace("\\", "/");
            }
            catch (System.Exception ex) {
                Debug.LogException(ex);
            }
            return "Assets/";
        }

        // ------------------------------------------------------------------------------------------------------------------
    }
}
