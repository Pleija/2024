#if UNITY_EDITOR
using UnityEditor;
using ParadoxNotion.Serialization;

namespace NodeCanvas.Editor
{
    ///<summary>NC framework preferences</summary>
    public static partial class Prefs
    {
        private const string PREFS_KEY_NAME = "NodeCanvas.EditorPreferences";

        [System.Serializable]
        private partial class SerializedData
        {
            public bool isEditorLocked = false;
            public bool useExternalInspector = false;
            public bool showBlackboard = true;
            public bool showNodePanel = true;
            public float inspectorPanelWidth = 330;
            public float blackboardPanelWidth = 350;
            public bool hideWelcomeWindow = false;
            public bool showTaskSummary = true;
            public bool showComments = true;
            public bool showNodeIDs = false;
            public bool showNodeElapsedTimes = false;
            public bool showHierarchyIcons = true;
            public bool showGrid = true;
            public bool snapToGrid = false;
            public bool logEventsInfo = true;
            public bool logVariablesInfo = true;
            public bool animatePanels = true;
            public float connectionsMLT = 0.8f;
            public bool hierarchicalMove = false;
            public bool breakpointPauseEditor = true;
            public bool collapseGenericTypes = false;
            public bool consoleLogInfo = true;
            public bool consoleLogWarning = true;
            public bool consoleLogError = true;
            public bool consoleClearOnPlay = true;
            public ConsoleLogOrder consoleLogOrder = ConsoleLogOrder.Ascending;
            public bool explorerShowTypeNames = true;
            public float minimapSizeY = 100f;
        }

        private static SerializedData _data;

        private static SerializedData data {
            get {
                if (_data == null) _data = new SerializedData();
                return _data;
            }
        }

        [InitializeOnLoadMethod]
        private static void LoadData()
        {
            var pref = EditorPrefs.GetString(PREFS_KEY_NAME);
            if (!string.IsNullOrEmpty(pref))
                _data = JSONSerializer.Deserialize<SerializedData>(pref);
            if (_data == null) _data = new SerializedData();
        }

        ///----------------------------------------------------------------------------------------------
        public const float MINIMAP_MIN_SIZE = 30;

        public const float MINIMAP_MAX_SIZE = 300;

        ///----------------------------------------------------------------------------------------------
        public enum ConsoleLogOrder { Ascending, Descending }

        public static bool isEditorLocked {
            get => data.isEditorLocked;
            set {
                if (data.isEditorLocked != value) {
                    data.isEditorLocked = value;
                    Save();
                }
            }
        }

        public static bool showBlackboard {
            get => data.showBlackboard;
            set {
                if (data.showBlackboard != value) {
                    data.showBlackboard = value;
                    Save();
                }
            }
        }

        public static bool showNodePanel {
            get => data.showNodePanel;
            set {
                if (data.showNodePanel != value) {
                    data.showNodePanel = value;
                    Save();
                }
            }
        }

        public static bool showTaskSummary {
            get => data.showTaskSummary;
            set {
                if (data.showTaskSummary != value) {
                    data.showTaskSummary = value;
                    Save();
                }
            }
        }

        public static bool showComments {
            get => data.showComments;
            set {
                if (data.showComments != value) {
                    data.showComments = value;
                    Save();
                }
            }
        }

        public static bool showNodeIDs {
            get => data.showNodeIDs;
            set {
                if (data.showNodeIDs != value) {
                    data.showNodeIDs = value;
                    Save();
                }
            }
        }

        public static bool showNodeElapsedTimes {
            get => data.showNodeElapsedTimes;
            set {
                if (data.showNodeElapsedTimes != value) {
                    data.showNodeElapsedTimes = value;
                    Save();
                }
            }
        }

        public static bool showGrid {
            get => data.showGrid;
            set {
                if (data.showGrid != value) {
                    data.showGrid = value;
                    Save();
                }
            }
        }

        public static bool snapToGrid {
            get => data.snapToGrid;
            set {
                if (data.snapToGrid != value) {
                    data.snapToGrid = value;
                    Save();
                }
            }
        }

        public static bool hierarchicalMove {
            get => data.hierarchicalMove;
            set {
                if (data.hierarchicalMove != value) {
                    data.hierarchicalMove = value;
                    Save();
                }
            }
        }

        public static bool useExternalInspector {
            get => data.useExternalInspector;
            set {
                if (data.useExternalInspector != value) {
                    data.useExternalInspector = value;
                    Save();
                }
            }
        }

        public static bool hideWelcomeWindow {
            get => data.hideWelcomeWindow;
            set {
                if (data.hideWelcomeWindow != value) {
                    data.hideWelcomeWindow = value;
                    Save();
                }
            }
        }

        public static bool logEventsInfo {
            get => data.logEventsInfo;
            set {
                if (data.logEventsInfo != value) {
                    data.logEventsInfo = value;
                    Save();
                }
            }
        }

        public static bool logVariablesInfo {
            get => data.logVariablesInfo;
            set {
                if (data.logVariablesInfo != value) {
                    data.logVariablesInfo = value;
                    Save();
                }
            }
        }

        public static bool showHierarchyIcons {
            get => data.showHierarchyIcons;
            set {
                if (data.showHierarchyIcons != value) {
                    data.showHierarchyIcons = value;
                    Save();
                }
            }
        }

        public static bool breakpointPauseEditor {
            get => data.breakpointPauseEditor;
            set {
                if (data.breakpointPauseEditor != value) {
                    data.breakpointPauseEditor = value;
                    Save();
                }
            }
        }

        public static bool collapseGenericTypes {
            get => data.collapseGenericTypes;
            set {
                if (data.collapseGenericTypes != value) {
                    data.collapseGenericTypes = value;
                    ParadoxNotion.Design.EditorUtils.FlushScriptInfos();
                    Save();
                }
            }
        }

        ///----------------------------------------------------------------------------------------------
        public static float inspectorPanelWidth {
            get => data.inspectorPanelWidth;
            set {
                if (data.inspectorPanelWidth != value) {
                    data.inspectorPanelWidth = UnityEngine.Mathf.Clamp(value, 300, 600);
                    Save();
                }
            }
        }

        public static float blackboardPanelWidth {
            get => data.blackboardPanelWidth;
            set {
                if (data.blackboardPanelWidth != value) {
                    data.blackboardPanelWidth = UnityEngine.Mathf.Clamp(value, 300, 600);
                    Save();
                }
            }
        }

        public static bool animatePanels {
            get => data.animatePanels;
            set {
                if (data.animatePanels != value) {
                    data.animatePanels = value;
                    Save();
                }
            }
        }

        public static float connectionsMLT {
            get => data.connectionsMLT;
            set {
                if (data.connectionsMLT != value) {
                    data.connectionsMLT = value;
                    Save();
                }
            }
        }

        ///----------------------------------------------------------------------------------------------
        public static bool consoleLogInfo {
            get => data.consoleLogInfo;
            set {
                if (data.consoleLogInfo != value) {
                    data.consoleLogInfo = value;
                    Save();
                }
            }
        }

        public static bool consoleLogWarning {
            get => data.consoleLogWarning;
            set {
                if (data.consoleLogWarning != value) {
                    data.consoleLogWarning = value;
                    Save();
                }
            }
        }

        public static bool consoleLogError {
            get => data.consoleLogError;
            set {
                if (data.consoleLogError != value) {
                    data.consoleLogError = value;
                    Save();
                }
            }
        }

        public static bool consoleClearOnPlay {
            get => data.consoleClearOnPlay;
            set {
                if (data.consoleClearOnPlay != value) {
                    data.consoleClearOnPlay = value;
                    Save();
                }
            }
        }

        public static ConsoleLogOrder consoleLogOrder {
            get => data.consoleLogOrder;
            set {
                if (data.consoleLogOrder != value) {
                    data.consoleLogOrder = value;
                    Save();
                }
            }
        }

        ///----------------------------------------------------------------------------------------------
        public static bool explorerShowTypeNames {
            get => data.explorerShowTypeNames;
            set {
                if (data.explorerShowTypeNames != value) {
                    data.explorerShowTypeNames = value;
                    Save();
                }
            }
        }

        ///----------------------------------------------------------------------------------------------
        public static float minimapSize {
            get => UnityEngine.Mathf.Clamp(data.minimapSizeY, MINIMAP_MIN_SIZE, MINIMAP_MAX_SIZE);
            set {
                if (data.minimapSizeY != value) {
                    data.minimapSizeY =
                        UnityEngine.Mathf.Clamp(value, MINIMAP_MIN_SIZE, MINIMAP_MAX_SIZE);
                    Save();
                }
            }
        }

        ///----------------------------------------------------------------------------------------------

        //Save the prefs
        private static void Save()
        {
            EditorPrefs.SetString(PREFS_KEY_NAME,
                JSONSerializer.Serialize(typeof(SerializedData), data));
        }
    }
}

#endif
