﻿#region
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using UnityEditor;
using UnityEngine;
using UnityEngine.Serialization;
using Random = UnityEngine.Random;
#endregion

namespace XNodeEditor
{
    public enum NoodlePath { Curvy, Straight, Angled, ShaderLab }
    public enum NoodleStroke { Full, Dashed }

    public static class NodeEditorPreferences
    {
        /// <summary> The last editor we checked. This should be the one we modify </summary>
        private static NodeGraphEditor lastEditor;

        /// <summary> The last key we checked. This should be the one we modify </summary>
        private static string lastKey = "xNode.Settings";

        private static Dictionary<Type, Color> typeColors = new Dictionary<Type, Color>();
        private static Dictionary<Type, Color> typeSelectedColors = new Dictionary<Type, Color>();
        private static Dictionary<string, Settings> settings = new Dictionary<string, Settings>();

        [Serializable]
        public class Settings : ISerializationCallbackReceiver
        {
            [SerializeField]
            private Color32 _gridLineColor = new Color(.23f, .23f, .23f);

            [SerializeField]
            private Color32 _gridBgColor = new Color(.19f, .19f, .19f);

            [FormerlySerializedAs("zoomOutLimit")]
            public float maxZoom = 5f;

            public float minZoom = 1f;
            public Color32 tintColor = new Color32(90, 97, 105, 255);
            public Color32 highlightColor = new Color32(255, 255, 255, 255);
            public bool gridSnap = true;
            public bool autoSave = true;
            public bool openOnCreate = true;
            public bool dragToCreate = true;
            public bool createFilter = true;
            public bool zoomToMouse = true;
            public bool portTooltips = true;

            [SerializeField]
            private string typeColorsData = "";

            [SerializeField]
            private string typeSelectedColorsData = "";

            public float noodleThickness = 2f;

            [FormerlySerializedAs("noodleType")]
            public NoodlePath noodlePath = NoodlePath.Curvy;

            public NoodleStroke noodleStroke = NoodleStroke.Full;
            private Texture2D _crossTexture;
            private Texture2D _gridTexture;

            [NonSerialized]
            private Dictionary<string, Color> typeColors;

            [NonSerialized]
            private Dictionary<string, Color> typeSelectedColors;

            public Color32 gridLineColor {
                get => _gridLineColor;
                set {
                    _gridLineColor = value;
                    _gridTexture = null;
                    _crossTexture = null;
                }
            }

            public Color32 gridBgColor {
                get => _gridBgColor;
                set {
                    _gridBgColor = value;
                    _gridTexture = null;
                }
            }

            [Obsolete("Use maxZoom instead")]
            public float zoomOutLimit {
                get => maxZoom;
                set => maxZoom = value;
            }

            public Dictionary<string, Color> TypeColors {
                get {
                    if (typeColors == null) {
                        // Deserialize typeColorsData
                        typeColors = new Dictionary<string, Color>();
                        var data = typeColorsData.Split(new[] { ',' },
                            StringSplitOptions.RemoveEmptyEntries);

                        for (var i = 0; i < data.Length; i += 2) {
                            Color col;
                            if (ColorUtility.TryParseHtmlString("#" + data[i + 1], out col))
                                typeColors.Add(data[i], col);
                        }
                    }
                    return typeColors;
                }
                set { }
            }

            public Dictionary<string, Color> TypeSelectedColors {
                get {
                    if (typeSelectedColors == null) {
                        // Deserialize typeSelectedColorsData
                        typeSelectedColors = new Dictionary<string, Color>();
                        var data = typeSelectedColorsData.Split(new[] { ',' },
                            StringSplitOptions.RemoveEmptyEntries);

                        for (var i = 0; i < data.Length; i += 2) {
                            Color col;
                            if (ColorUtility.TryParseHtmlString("#" + data[i + 1], out col))
                                typeSelectedColors.Add(data[i], col);
                        }
                    }
                    return typeSelectedColors;
                }
                set { }
            }

            public Texture2D gridTexture {
                get {
                    if (_gridTexture == null)
                        _gridTexture = NodeEditorResources.GenerateGridTexture(
                            gridLineColor, gridBgColor);
                    return _gridTexture;
                }
            }

            public Texture2D crossTexture {
                get {
                    if (_crossTexture == null)
                        _crossTexture = NodeEditorResources.GenerateCrossTexture(gridLineColor);
                    return _crossTexture;
                }
            }

            public void OnAfterDeserialize() { }

            public void OnBeforeSerialize()
            {
                // Serialize typeColors
                TypeColors.Any();
                typeColorsData = "";
                foreach (var item in typeColors)
                    typeColorsData +=
                            item.Key + "," + ColorUtility.ToHtmlStringRGB(item.Value) + ",";

                // Serialize typeSelectedColors
                TypeSelectedColors.Any();
                typeSelectedColorsData = "";
                foreach (var item in typeSelectedColors)
                    typeSelectedColorsData +=
                            item.Key + "," + ColorUtility.ToHtmlStringRGB(item.Value) + ",";
            }
        }

        private static Func<string, Settings> GetSettingsOverride = GetSettingsInternal;

        public static void SetSettingsOverride(Func<string, Settings> settingsOverride)
        {
            GetSettingsOverride = settingsOverride;
        }

        /// <summary> Get settings of current active editor </summary>
        public static Settings GetSettings() => GetSettingsInternal();

        private static Settings GetSettingsInternal(string key)
        {
            if (!settings.ContainsKey(lastKey)) VerifyLoaded();
            return settings[lastKey];
        }

        /// <summary> Get settings of current active editor </summary>
        private static Settings GetSettingsInternal()
        {
            if (NodeEditorWindow.current == null) return new Settings();

            if (lastEditor != NodeEditorWindow.current.graphEditor) {
                var attribs = NodeEditorWindow.current.graphEditor.GetType()
                        .GetCustomAttributes(typeof(NodeGraphEditor.CustomNodeGraphEditorAttribute),
                            true);

                if (attribs.Length == 1) {
                    var attrib = attribs[0] as NodeGraphEditor.CustomNodeGraphEditorAttribute;
                    lastEditor = NodeEditorWindow.current.graphEditor;
                    lastKey = attrib.editorPrefsKey;
                }
                else {
                    return null;
                }
            }
            return GetSettingsOverride(lastKey);
        }

#if UNITY_2019_1_OR_NEWER
        [SettingsProvider]
        public static SettingsProvider CreateXNodeSettingsProvider()
        {
            if (GetSettingsOverride != GetSettingsInternal) return null;
            var provider = new SettingsProvider("Preferences/Node Editor", SettingsScope.User) {
                guiHandler = searchContext => {
                    PreferencesGUI();
                },
                keywords = new HashSet<string>(new[]
                        { "xNode", "node", "editor", "graph", "connections", "noodles", "ports" }),
            };
            return provider;
        }
#endif
#if !UNITY_2019_1_OR_NEWER
        [PreferenceItem("Node Editor")]
#endif
        private static void PreferencesGUI()
        {
            VerifyLoaded();
            var settings = NodeEditorPreferences.settings[lastKey];
            if (GUILayout.Button(
                new GUIContent("Documentation", "https://github.com/Siccity/xNode/wiki"),
                GUILayout.Width(100)))
                Application.OpenURL("https://github.com/Siccity/xNode/wiki");
            EditorGUILayout.Space();
            NodeSettingsGUI(lastKey, settings);
            GridSettingsGUI(lastKey, settings);
            SystemSettingsGUI(lastKey, settings);
            TypeColorsGUI(lastKey, settings);
            if (GUILayout.Button(new GUIContent("Set Default", "Reset all values to default"),
                GUILayout.Width(120)))
                ResetPrefs();
        }

        private static void GridSettingsGUI(string key, Settings settings)
        {
            //Label
            EditorGUILayout.LabelField("Grid", EditorStyles.boldLabel);
            settings.gridSnap = EditorGUILayout.Toggle(
                new GUIContent("Snap", "Hold CTRL in editor to invert"), settings.gridSnap);
            settings.zoomToMouse = EditorGUILayout.Toggle(
                new GUIContent("Zoom to Mouse", "Zooms towards mouse position"),
                settings.zoomToMouse);
            EditorGUILayout.LabelField("Zoom");
            EditorGUI.indentLevel++;
            settings.maxZoom = EditorGUILayout.FloatField(
                new GUIContent("Max", "Upper limit to zoom"), settings.maxZoom);
            settings.minZoom = EditorGUILayout.FloatField(
                new GUIContent("Min", "Lower limit to zoom"), settings.minZoom);
            EditorGUI.indentLevel--;
            settings.gridLineColor = EditorGUILayout.ColorField("Color", settings.gridLineColor);
            settings.gridBgColor = EditorGUILayout.ColorField(" ", settings.gridBgColor);

            if (GUI.changed) {
                SavePrefs(key, settings);
                NodeEditorWindow.RepaintAll();
            }
            EditorGUILayout.Space();
        }

        private static void SystemSettingsGUI(string key, Settings settings)
        {
            //Label
            EditorGUILayout.LabelField("System", EditorStyles.boldLabel);
            settings.autoSave = EditorGUILayout.Toggle(
                new GUIContent("Autosave", "Disable for better editor performance"),
                settings.autoSave);
            settings.openOnCreate = EditorGUILayout.Toggle(new GUIContent("Open Editor on Create",
                    "Disable to prevent openening the editor when creating a new graph"),
                settings.openOnCreate);
            if (GUI.changed) SavePrefs(key, settings);
            EditorGUILayout.Space();
        }

        private static void NodeSettingsGUI(string key, Settings settings)
        {
            //Label
            EditorGUILayout.LabelField("Node", EditorStyles.boldLabel);
            settings.tintColor = EditorGUILayout.ColorField("Tint", settings.tintColor);
            settings.highlightColor =
                    EditorGUILayout.ColorField("Selection", settings.highlightColor);
            settings.noodlePath = (NoodlePath)EditorGUILayout.EnumPopup(
                "Noodle path", settings.noodlePath);
            settings.noodleThickness = EditorGUILayout.FloatField(
                new GUIContent("Noodle thickness", "Noodle Thickness of the node connections"),
                settings.noodleThickness);
            settings.noodleStroke = (NoodleStroke)EditorGUILayout.EnumPopup(
                "Noodle stroke", settings.noodleStroke);
            settings.portTooltips = EditorGUILayout.Toggle("Port Tooltips", settings.portTooltips);
            settings.dragToCreate = EditorGUILayout.Toggle(new GUIContent("Drag to Create",
                    "Drag a port connection anywhere on the grid to create and connect a node"),
                settings.dragToCreate);
            settings.createFilter = EditorGUILayout.Toggle(new GUIContent("Create Filter",
                    "Only show nodes that are compatible with the selected port"),
                settings.createFilter);

            //END
            if (GUI.changed) {
                SavePrefs(key, settings);
                NodeEditorWindow.RepaintAll();
            }
            EditorGUILayout.Space();
        }

        private static void TypeColorsGUI(string key, Settings settings)
        {
            //Label
            EditorGUILayout.LabelField("Types", EditorStyles.boldLabel);

            //Display type colors. Save them if they are edited by the user
            var keys = typeColors.Keys.ToArray();

            foreach (var type in keys) {
                var typeColorKey = type.PrettyName();
                Color col;
                typeColors.TryGetValue(type, out col);
                var selectedCol = col;
                typeSelectedColors.TryGetValue(type, out selectedCol);
                EditorGUI.BeginChangeCheck();
                EditorGUILayout.BeginHorizontal();
                EditorGUILayout.PrefixLabel(typeColorKey);
                EditorGUILayout.LabelField("Color", GUILayout.Width(70));
                col = EditorGUILayout.ColorField(col);
                EditorGUILayout.LabelField("Selected", GUILayout.Width(70));
                selectedCol = EditorGUILayout.ColorField(selectedCol);
                EditorGUILayout.EndHorizontal();

                if (EditorGUI.EndChangeCheck()) {
                    typeColors[type] = col;
                    if (settings.TypeColors.ContainsKey(typeColorKey))
                        settings.TypeColors[typeColorKey] = col;
                    else
                        settings.TypeColors.Add(typeColorKey, col);
                    typeSelectedColors[type] = selectedCol;
                    if (settings.TypeSelectedColors.ContainsKey(typeColorKey))
                        settings.TypeSelectedColors[typeColorKey] = selectedCol;
                    else
                        settings.TypeSelectedColors.Add(typeColorKey, selectedCol);
                    SavePrefs(key, settings);
                    NodeEditorWindow.RepaintAll();
                }
            }
        }

        /// <summary> Load prefs if they exist. Create if they don't </summary>
        private static Settings LoadPrefs()
        {
            // Create settings if it doesn't exist
            if (!EditorPrefs.HasKey(lastKey)) {
                if (lastEditor != null)
                    EditorPrefs.SetString(lastKey,
                        JsonUtility.ToJson(lastEditor.GetDefaultPreferences()));
                else
                    EditorPrefs.SetString(lastKey, JsonUtility.ToJson(new Settings()));
            }
            return JsonUtility.FromJson<Settings>(EditorPrefs.GetString(lastKey));
        }

        /// <summary> Delete all prefs </summary>
        public static void ResetPrefs()
        {
            if (EditorPrefs.HasKey(lastKey)) EditorPrefs.DeleteKey(lastKey);
            if (settings.ContainsKey(lastKey)) settings.Remove(lastKey);
            typeColors = new Dictionary<Type, Color>();
            VerifyLoaded();
            NodeEditorWindow.RepaintAll();
        }

        /// <summary> Save preferences in EditorPrefs </summary>
        private static void SavePrefs(string key, Settings settings)
        {
            EditorPrefs.SetString(key, JsonUtility.ToJson(settings));
        }

        /// <summary> Check if we have loaded settings for given key. If not, load them </summary>
        private static void VerifyLoaded()
        {
            if (!settings.ContainsKey(lastKey)) settings.Add(lastKey, LoadPrefs());
        }

        /// <summary> Return color based on type </summary>
        public static Color GetTypeColor(Type type)
        {
            VerifyLoaded();
            if (type == null) return Color.gray;
            Color col;
            Color selectedCol;

            if (!typeColors.TryGetValue(type, out col)) {
                var typeName = type.PrettyName();

                if (settings[lastKey].TypeColors.ContainsKey(typeName)) {
                    typeColors.Add(type, settings[lastKey].TypeColors[typeName]);
                    typeSelectedColors.Add(type, settings[lastKey].TypeSelectedColors[typeName]);
                }
                else {
                    var defaultColorsAttribute = TypeDescriptor.GetAttributes(type)
                            .OfType<DefaultNoodleColorAttribute>()
                            .FirstOrDefault();

                    if (defaultColorsAttribute == null) {
#if UNITY_5_4_OR_NEWER
                        Random.InitState(typeName.GetHashCode());
#else
                        UnityEngine.Random.seed = typeName.GetHashCode();
#endif
                        selectedCol = new Color(Random.value, Random.value, Random.value);
                        col = new Color(selectedCol.r * 0.6f, selectedCol.g * 0.6f,
                            selectedCol.b * 0.6f);
                        typeSelectedColors[type] = selectedCol;
                        typeColors.Add(type, col);
                    }
                    else {
                        selectedCol = defaultColorsAttribute.SelectedColor;
                        col = defaultColorsAttribute.Color;
                        typeSelectedColors[type] = selectedCol;
                        typeColors.Add(type, col);
                    }
                }
            }
            return col;
        }

        /// <summary> Return color based on type </summary>
        public static Color GetSelectedTypeColor(Type type)
        {
            VerifyLoaded();
            if (type == null) return Color.gray;
            Color col;
            Color selectedCol;

            if (!typeSelectedColors.TryGetValue(type, out selectedCol)) {
                var typeName = type.PrettyName();

                if (settings[lastKey].TypeSelectedColors.ContainsKey(typeName)) {
                    typeColors.Add(type, settings[lastKey].TypeColors[typeName]);
                    typeSelectedColors.Add(type, settings[lastKey].TypeSelectedColors[typeName]);
                }
                else {
                    var defaultColorsAttribute = TypeDescriptor.GetAttributes(type)
                            .OfType<DefaultNoodleColorAttribute>()
                            .FirstOrDefault();

                    if (defaultColorsAttribute == null) {
#if UNITY_5_4_OR_NEWER
                        Random.InitState(typeName.GetHashCode());
#else
                        UnityEngine.Random.seed = typeName.GetHashCode();
#endif
                        selectedCol = new Color(Random.value, Random.value, Random.value);
                        col = new Color(selectedCol.r * 0.6f, selectedCol.g * 0.6f,
                            selectedCol.b * 0.6f);
                        typeSelectedColors[type] = selectedCol;
                        typeColors.Add(type, col);
                    }
                    else {
                        selectedCol = defaultColorsAttribute.SelectedColor;
                        col = defaultColorsAttribute.Color;
                        typeSelectedColors[type] = selectedCol;
                        typeColors.Add(type, col);
                    }
                }
            }
            return selectedCol;
        }
    }
}
