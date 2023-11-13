//using MoreTags;

using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using Runtime.Favourites.Runtime;
using Sirenix.Utilities;
#if GOQL
using Unity.GoQL;
#endif
using UnityEditor;
using UnityEditor.IMGUI.Controls;
using UnityEditor.SceneManagement;
using UnityEditorInternal;
using UnityEngine;

namespace Favourites.Editor
{
    public class FavouritesTreeView : TreeViewWithTreeModel<FavouritesTreeElement>
    {
        static readonly GUIContent GC_None = new GUIContent("No Favourites.");
        static readonly string DragAndDropID = "FavouritesTreeElement";
        public TreeModel<FavouritesTreeElement> Model => model;
        TreeModel<FavouritesTreeElement> model;
        FavouritesAsset asset;

        // ------------------------------------------------------------------------------------------------------------

        public FavouritesTreeView(TreeViewState treeViewState) : base(treeViewState)
        {
            baseIndent = 5f;
        }

        public void OnGUI()
        {
            if(model != null && model.Data != null && model.Data.Count > 1) {
                base.OnGUI(GUILayoutUtility.GetRect(1, 1, GUILayout.ExpandWidth(true),
                    GUILayout.ExpandHeight(true)));
            }
            else {
                GUILayout.Label(GC_None);
                GUILayout.FlexibleSpace();
            }
        }

        public void LoadAndUpdate(FavouritesAsset favsAsset = null)
        {
            if(favsAsset != null) asset = favsAsset;

            // add root
            var treeRoot = new FavouritesTreeElement() {
                ID = 0,
                Depth = -1,
                Name = "Root"
            };
            model = new TreeModel<FavouritesTreeElement>(new List<FavouritesTreeElement>() {
                treeRoot
            });

            // add categories
            var categories = new List<FavouritesTreeElement>();
            var icon = EditorGUIUtility.IconContent(FolderIconName()).image as Texture2D;

            foreach(var c in asset.categories) {
                var ele = new FavouritesTreeElement() {
                    Name = c.name,
                    Icon = icon,
                    ID = model.GenerateUniqueID(),
                    category = c
                };
                categories.Add(ele);
                model.QuickAddElement(ele, treeRoot);
            }

            // 生成默认根节点
            if(!categories.Any()) {
                var c = new FavouritesCategory() {
                    id = model.GenerateUniqueID(),
                    name = "default"
                };
                var ele = new FavouritesTreeElement() {
                    Name = c.name,
                    Icon = icon,
                    ID = model.GenerateUniqueID(),
                    category = c
                };
                categories.Add(ele);
                model.QuickAddElement(ele, treeRoot);
            }

            //end

            // add favourites from project and scene(s)
            var favs = new List<FavouritesElement>();
            favs.AddRange(asset.favs);

            // add from scene(s)
            foreach(var c in FavouritesEd.Containers) {
                if(c == null || c.favs == null) continue;
                favs.AddRange(c.favs);
            }

            // sort
            favs.Sort((a, b) => {
                var r = a.categoryId.CompareTo(b.categoryId);
                if(r == 0 && a.obj != null && b.obj != null) r = a.obj.name.CompareTo(b.obj.name);
                return r;
            });

            // 添加所有带tag的
            var firstCat = categories.FirstOrDefault()?.category;

            //            if (firstCat != null && TagManager.Data != null) {
            //                Object.FindObjectsOfType<GameObject>(true)
            //                    .Where(go => Extensions.GetTags(go).Any() && favs.All(t => t.obj != go)).ForEach(go => {
            //                        var add = new FavouritesElement {
            //                            obj = go,
            //                            categoryId = firstCat.id
            //                        };
            //                        favs.Add(add);
            //                    });
            //            }

            //add auto component
            categories.Where(x => Regex.IsMatch(x.category.name, @"<\w+>")).ForEach(x => {
                var m = Regex.Match(x.category.name, @"<(\w+?)>");

                if(m.Success) {
                    //Debug.Log(m.Groups[1].Value);
#if GOQL
                        var selection = new GoQLExecutor($"<t:{m.Groups[1].Value}>").Execute();
                             selection.ForEach(go => {
                                 if (!favs.Any(t => t.obj == go && t.categoryId == x.category.id)) {
                                     favs.Add(new FavouritesElement() {
                                         obj = go,
                                         categoryId = x.category.id
                                     });
     
                                 }
                             });
#endif
                }
            });

            // and add to tree
            foreach(var ele in favs) {
                if(ele == null || ele.obj == null) continue;

                foreach(var c in categories)
                    if(c.category.id == ele.categoryId) {
                        var nm = ele.obj.name;
                        var go = ele.obj as GameObject ?? (ele.obj as Component)?.gameObject;
                        if(go != null && go.scene.IsValid())
                            nm = ele.obj is GameObject ? $" {nm} ({go.scene.name})"
                                : $" {ele.obj.GetType().GetNiceName()} ({nm}, {go.scene.name})";

                        //                            var tags = Extensions.GetTags(go);
                        //                            if (tags.Any()) {
                        //                                nm += " { " + string.Join(", ", tags) + " }";
                        //                            }
                        //else
                        //{
                        //	nm = string.Format("{0} ({1})", nm, AssetDatabase.GetAssetPath(ele.obj));
                        //}
                        icon = AssetPreview.GetMiniThumbnail(ele.obj) ??
                            AssetPreview.GetMiniTypeThumbnail(ele.obj.GetType());
                        model.QuickAddElement(new FavouritesTreeElement() {
                            Name = nm,
                            Icon = icon,
                            ID = model.GenerateUniqueID(),
                            fav = ele
                        }, c);
                        break;
                    }
            }
            model.UpdateDataFromTree();
            Init(model);
            Reload();
            SetSelection(new List<int>());
        }

        protected override void RowGUI(RowGUIArgs args)
        {
            base.RowGUI(args);
        }

        /// <summary>
        ///   <para>Override this method to handle single click events on an item.</para>
        /// </summary>
        /// <param name="id">ID of TreeViewItem that was single clicked.</param>
        protected override void SingleClickedItem(int id)
        {
            var ele = Model.Find(id);
            if(ele?.fav?.obj != null) Selection.activeObject = ele.fav.obj;
        }

        protected override void ContextClickedItem(int id)
        {
            var menu = new GenericMenu();
            menu.AddItem(new GUIContent("Ping"), false, HandleContextOption, id);
            var ele = Model.Find(id);

            if(ele != null && ele.fav != null && ele.fav.obj != null) {
                // EditorGUIUtility.PingObject(ele.fav.obj);
                //                if (ele.fav.obj is GameObject go) {
                //                    foreach (var tag in TagPreset.GetPresets().Union(TagSystem.Tags())
                //
                //                        //.Except(go.GetTags())
                //                    ) {
                //                        menu.AddItem(new GUIContent(tag.Replace(".", "/")), go.HasTag(tag), () => {
                //                            if (go.HasTag(tag)) {
                //                                go.RemoveTag(tag);
                //                            }
                //                            else {
                //                                go.AddTag(tag);
                //                            }
                //
                //                            var nm = ele.Name;
                //                            nm = ele.fav.obj is GameObject
                //                                ? $" {nm} ({go.scene.name})"
                //                                : $" {ele.fav.obj.GetType().GetNiceName()} ({nm}, {go.scene.name})";
                //                            var tags = Extensions.GetTags(go);
                //                            if (tags.Any()) {
                //                                nm += " { " + string.Join(", ", tags) + " }";
                //                            }
                //
                //                            ele.Name = nm;
                //                            LoadAndUpdate();
                //                        });
                //                    }
                //                }
            }
            menu.ShowAsContext();
        }

        void HandleContextOption(object arg)
        {
            var id = (int)arg;
            var ele = Model.Find(id);
            if(ele != null && ele.fav != null && ele.fav.obj != null)
                EditorGUIUtility.PingObject(ele.fav.obj);
        }

        protected override void DoubleClickedItem(int id)
        {
            var ele = Model.Find(id);
            if(ele != null && ele.fav != null && ele.fav.obj != null)
                AssetDatabase.OpenAsset(ele.fav.obj);
            else
                SetExpanded(id, !IsExpanded(id));
        }

        protected override bool CanMultiSelect(TreeViewItem item)
        {
            return false;
        }

        protected override bool CanStartDrag(CanStartDragArgs args)
        {
            if(asset == null || asset.categories.Count == 0 || !rootItem.hasChildren ||
               args.draggedItem.parent == rootItem)
                return false;
            return true;
        }

        protected override void SetupDragAndDrop(SetupDragAndDropArgs args)
        {
            if(args.draggedItemIDs.Count == 0) return;
            var item = Model.Find(args.draggedItemIDs[0]);
            if(item == null || item.fav == null || item.fav.obj == null) return;
            DragAndDrop.PrepareStartDrag();
            DragAndDrop.SetGenericData(DragAndDropID, item);
            DragAndDrop.objectReferences = new Object[] { item.fav.obj };
            DragAndDrop.StartDrag(item.fav.obj.name);
        }

        protected override DragAndDropVisualMode HandleDragAndDrop(DragAndDropArgs args)
        {
            if(asset == null || asset.categories.Count == 0 || !rootItem.hasChildren)
                return DragAndDropVisualMode.Rejected;

            if(args.performDrop) {
                FavouritesTreeElement ele;
                var id = args.parentItem == null ? -1 : args.parentItem.id;

                if(id < 0 || (ele = model.Find(id)) == null || ele.category == null) {
                    var ids = GetSelection();

                    if(ids.Count > 0) {
                        var item = FindItem(ids[0], rootItem);
                        if(item == null) return DragAndDropVisualMode.Rejected;
                        id = item.parent == rootItem ? item.id : item.parent.id;
                    }
                    else {
                        id = rootItem.children[0].id;
                    }
                    ele = model.Find(id);
                }
                if(ele == null || ele.category == null) return DragAndDropVisualMode.Rejected;
                var categoryId = ele.category.id;

                // first check if it is "internal" drag drop from one category to another
                var draggedEle = DragAndDrop.GetGenericData(DragAndDropID) as FavouritesTreeElement;

                if(draggedEle != null) {
                    draggedEle.fav.categoryId = categoryId;

                    // check if in scene and mark scene dirty, else do nothing
                    // more since asset is marked dirty at end anyway
                    var go = draggedEle.fav.obj as GameObject;

                    if(go != null && go.scene.IsValid()) {
                        EditorSceneManager.MarkSceneDirty(go.scene);
                        Debug.Log("set dirty");
                    }
                }

                // else the drag-drop originated somewhere else
                else {
                    var objs = DragAndDrop.objectReferences;

                    foreach(var obj in objs) {
                        // check if in scene
                        var go = obj as GameObject;

                        if(go != null && go.scene.IsValid()) {
                            AddToSceneFavs(go, categoryId);
                            continue;
                        }

                        // make sure it is not a component
                        if(obj as Component != null) {
                            AddToSceneFavs(obj as Component, categoryId);
                            continue;
                        }

                        // else, probably something from project panel
                        asset.favs.Add(new FavouritesElement() {
                            obj = obj,
                            categoryId = categoryId
                        });
                    }
                }
                EditorUtility.SetDirty(asset);
                Debug.Log("set dirty");
                LoadAndUpdate();
            }
            return DragAndDropVisualMode.Generic;
        }

        // ------------------------------------------------------------------------------------------------------------

        void AddToSceneFavs(GameObject go, int categoryId)
        {
            var container = FavouritesEd.GetContainer(go.scene);
            if(container == null) return; // just in case
            container.favs.Add(new FavouritesElement() {
                categoryId = categoryId,
                obj = go
            });
            EditorSceneManager.MarkSceneDirty(go.scene);
            Debug.Log("set dirty");
        }

        void AddToSceneFavs(Component component, int categoryId)
        {
            var go = component?.gameObject;
            if(go == null) return;
            var container = FavouritesEd.GetContainer(go.scene);
            if(container == null) return; // just in case
            container.favs.Add(new FavouritesElement() {
                categoryId = categoryId,
                obj = component
            });
            EditorSceneManager.MarkSceneDirty(go.scene);
            Debug.Log("set dirty");
        }

        static System.Func<string> Invoke_folderIconName;

        static string FolderIconName()
        {
            if(Invoke_folderIconName == null) {
                var asm = Assembly.GetAssembly(typeof(UnityEditor.Editor));
                var prop = asm.GetType("UnityEditorInternal.EditorResourcesUtility")
                    ?.GetProperty("folderIconName", BindingFlags.Static | BindingFlags.Public);
                var method = prop?.GetGetMethod(true);

                if(method != null) {
                    Invoke_folderIconName =
                        (System.Func<string>)System.Delegate.CreateDelegate(
                            typeof(System.Func<string>), method);
                    return Invoke_folderIconName();
                }
            }
            return "Folder Icon";
        }

        // ------------------------------------------------------------------------------------------------------------
    }
}
