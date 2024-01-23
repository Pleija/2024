#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using UnityEditor;
using UnityEngine;

namespace MoreTags
{
    public class TagGUI
    {
        public Action<string> OnAddItem;
        public Action<string> OnClickItem;
        public Action<string> OnRemoveItem;
        public Action<Rect, string> OnRightClickItem;
        public Func<string, GUIContent> OnItemString;
        public Func<string, Color> OnItemColor;
        private string m_NewItem = string.Empty;
        private GUIStyle m_BgStyle = null;
        private static readonly SortedDictionary<object, TagGUI> instances = new SortedDictionary<object, TagGUI>();

        public static void SetTags(Action<TagGUI> onCreate, TagDataList data, string header = null)
        {
            var tagGUI = data.tagGUI ??= new TagGUI();
            // var tags = (target as PrefabTags);
            //var tags = data.Select(x => x.name).ToList();

            void AddTag( /*List<string> tags,*/ string tag)
            {
                TagSystem.AddTag(tag);
                if (!data.data.Select(x => x.name).ToList().Contains(tag)) data.data.Add(new TagData() { name = tag });
            }

            /*var*/
            if (!tagGUI.Initial) {
                tagGUI.Initial = true;
                TagSystem.AddTag(data.data.Select(x => x.name).ToArray());
                // var tagGUI = new TagGUI();
                tagGUI.OnItemString += //TagManagerEditor.OnItemString;
                    item => {
                        var t = data.data.First(x => x.name == item);
                        return new GUIContent(string.IsNullOrEmpty(t.value) ? item.Replace(".", "/")
                            : $"{item} = {t.value}");
                    };
                tagGUI.OnItemColor += (item) => {
                    return data.data.First(x => x.name == item).enable ? Color.green : Color.red;
                    // return TagPreset.GetPresetColor(item);
                };
                tagGUI.OnAddItem += (item) => {
                    if (!string.IsNullOrEmpty(item)) {
                        AddTag(item);
                    }
                    else {
                        var menu = new GenericMenu();
                        foreach (var tag in TagPreset.GetPresets().Union(TagSystem.GetAllTags())
                            .Except(data.data.Select(x => x.name).ToList()).OrderBy(t => t.Contains(".") ? 0 : 1)
                            .ThenBy(tag => tag /*TagPreset.GetTagOrder(tag)*/))
                            menu.AddItem(new GUIContent(tag.Replace(".", "/")), false, () => AddTag(tag));
                        menu.ShowAsContext();
                    }
                };
                tagGUI.OnClickItem += (item) => {
                    var t = data.data.First(x => x.name == item);
                    t.enable = !t.enable;
                };
                tagGUI.OnRightClickItem += //TagManagerEditor.OnRightClickItem;
                    (Rect rect, string item) => {
                        var t = data.data.First(x => x.name == item);
                        var menu = new GenericMenu();
                        menu.AddItem(new GUIContent("Remove"), false, () => {
                            data.data.RemoveAll(t => t.name == item);
                            tagGUI.OnRemoveItem?.Invoke(item);
                        });
                        menu.AddSeparator("");
                        menu.AddItem(new GUIContent("[NONE]"), string.IsNullOrEmpty(t.value), () => {
                            t.value = null;
                            //AddTag(tag);
                        });
                        foreach (var tag in TagPreset.GetPresets().Union(TagSystem.GetAllTags()).Except(new[] { item })
                            .OrderBy(t => t.Contains(".") ? 0 : 1).ThenBy(tag => tag /*TagPreset.GetTagOrder(tag)*/))
                            menu.AddItem(new GUIContent(tag.Replace(".", "/")), t.value == tag, () => {
                                //var t = data.First(x => x.name == item);
                                t.value = tag;
                                //AddTag(tag);
                            });
                        menu.ShowAsContext();
                    };
                onCreate?.Invoke(tagGUI);
            }
            tagGUI.OnGUI(data.data.Select(x => x.name).ToList(), header);
        }

        public bool Initial { get; set; }

        public void InitStyle()
        {
            if (m_BgStyle != null) return;
            m_BgStyle = new GUIStyle("CN CountBadge" /*"CN CountBadge"*/);
            if (!EditorGUIUtility.isProSkin) return;
            var res = Resources.FindObjectsOfTypeAll<Texture2D>();
            foreach (var tex in res)
                if (tex.name.Equals("ConsoleCountBadge") && tex != m_BgStyle.normal.background)
                    m_BgStyle.normal.background = tex;
        }

        public void OnGUI(IEnumerable<string> list, string header = null)
        {
            InitStyle();
            var guicolor = GUI.color;
            var tagstyle = new GUIStyle("Label" /*"OL Minus"*/);
            //tagstyle.fixedWidth = 20;
            tagstyle.normal.textColor = Color.white;
            tagstyle.font = EditorStyles.boldFont;
            var addstyle = new GUIStyle("OL Plus");
            var headstyle = new GUIStyle("label");
            headstyle.font = EditorStyles.boldFont;
            //float contextWidth = (float)typeof(EditorGUIUtility).GetProperty("contextWidth", BindingFlags.NonPublic | BindingFlags.Static).GetValue(null, null);
            //Debug.Log(contextWidth);
            var contextWidth = /*GUILayoutUtility.GetLastRect()?.width ??*/ 350;
            //var r = EditorGUILayout.las
            var xMax = contextWidth /*;EditorGUIUtility.currentViewWidth*/ - 12;
            var height = EditorGUIUtility.singleLineHeight + 2;
            var newrect = EditorGUILayout.GetControlRect(GUILayout.Height(height));
            var bgrect = new Rect(newrect);
            bgrect.xMin = 16;

            if (!string.IsNullOrEmpty(header)) {
                var gc = new GUIContent(header);
                var w = headstyle.CalcSize(gc).x + 4;
                bgrect.width = w;
                GUI.color = new Color(0, 0, 0, 0);
                GUI.Box(bgrect, GUIContent.none, m_BgStyle);
                GUI.color = guicolor;
                var rect = new Rect(bgrect);
                rect.position += new Vector2(1, 1);
                GUI.Label(rect, gc, headstyle);
                bgrect.xMin = bgrect.xMax;
            }

            foreach (var item in list) {
                var s = item is string ? item as string : item.ToString();
                var gc = OnItemString != null ? OnItemString(item) : new GUIContent(s);
                var w = tagstyle.CalcSize(gc).x + 4;

                if (bgrect.xMin + w > xMax) {
                    newrect = EditorGUILayout.GetControlRect(GUILayout.Height(height));
                    bgrect = new Rect(newrect);
                    bgrect.xMin = string.IsNullOrEmpty(header) ? 16 : 30;
                }
                bgrect.xMin += 2;
                bgrect.width = w + 2;
                var col = Color.white;
                if (OnItemColor != null) col = OnItemColor(item);
                GUI.color = col;
                GUI.Box(bgrect, GUIContent.none, m_BgStyle);
                //var lum = col.grayscale > 0.5 ? col.grayscale - 0.5f : col.grayscale + 0.5f;
                GUI.color = Color.white; //col; //new Color(lum, lum, lum, 1.0f);
                var rect = new Rect(bgrect);
                //todo: Tag文本位置
                rect.position += new Vector2(3, 0);
                tagstyle.hover.textColor = Color.yellow;

                if (GUI.Button(rect, gc, tagstyle)) {
                    if (Event.current.button == 0 && OnClickItem != null) OnClickItem(item);
                    if (Event.current.button == 1 && OnRightClickItem != null) OnRightClickItem(rect, item);
                }
                bgrect.xMin = bgrect.xMax;
                GUI.color = guicolor;
            }

            if (OnAddItem != null) {
                if (bgrect.xMin + 150 > xMax) {
                    newrect = EditorGUILayout.GetControlRect(GUILayout.Height(height));
                    bgrect = new Rect(newrect);
                    bgrect.xMin = string.IsNullOrEmpty(header) ? 16 : 30;
                }
                bgrect.width = 150;
                bgrect.height -= 2;
                bgrect.xMin += 3;
                GUI.Box(bgrect, GUIContent.none, m_BgStyle);
                var gc = GUIContent.none;
                var w = tagstyle.CalcSize(gc).x;
                var rect = new Rect(bgrect);
                //rect.xMin += 3;
                rect.position += new Vector2(5, 0);
                rect.width = w + 3;

                if (GUI.Button(rect, gc, addstyle)) {
                    OnAddItem(m_NewItem);
                    m_NewItem = string.Empty;
                }
                rect = new Rect(bgrect);
                rect.yMin -= 1;
                rect.yMax -= 1;
                rect.xMin += w + 15;
                rect.xMax -= 8;
                m_NewItem = GUI.TextField(rect, m_NewItem);
                bgrect.xMin = bgrect.xMax;
            }
        }
    }
}
#endif
