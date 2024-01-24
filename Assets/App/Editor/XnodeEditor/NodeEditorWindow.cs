#region
#if ODIN_INSPECTOR
using Sirenix.OdinInspector.Editor;
#endif
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Sirenix.Utilities;
using UnityEditor;
using UnityEditor.Callbacks;
using UnityEngine;
using XNode;
using Object = UnityEngine.Object;
#endregion

namespace XNodeEditor
{
    [InitializeOnLoad]
    public partial class NodeEditorWindow : EditorWindow
    {
        public static NodeEditorWindow current;

        private static string ArrowRightBase64 =
                "iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAGvmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0MzUyLCAyMDIwLzAxLzMwLTE1OjUwOjM4ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA0LTI5VDA4OjUwOjI5LTA0OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTA0LTI5VDExOjE0OjEyLTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wNC0yOVQxMToxNDoxMi0wNDowMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1NzFhMzNiNC01YTAwLTc0NDgtOWE0Zi0zNWZiNDk0NTRmM2UiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDplMTA3NDc2Mi00ZmI1LTFkNDAtOTM5Mi0yMmFkMTFlYjI1NjEiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo5N2VhZGE3Ni0zMmU1LTI0NGMtYWY5Ny1lY2I5NzhkZDA1OWMiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjk3ZWFkYTc2LTMyZTUtMjQ0Yy1hZjk3LWVjYjk3OGRkMDU5YyIgc3RFdnQ6d2hlbj0iMjAyMC0wNC0yOVQwODo1MDoyOS0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoyNDEzZDRkMC0wOWI4LTIzNGItOTI5YS0xYjQyYTM4ZWYwMGEiIHN0RXZ0OndoZW49IjIwMjAtMDQtMjlUMDg6NTA6MjktMDQ6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTcxYTMzYjQtNWEwMC03NDQ4LTlhNGYtMzVmYjQ5NDU0ZjNlIiBzdEV2dDp3aGVuPSIyMDIwLTA0LTI5VDExOjE0OjEyLTA0OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wyv5twAAAF5JREFUOMvF1EcOACAIBMD9/6fXA3iw0xJJMFyc2BAkUZEyANTMQ5SCWtsmayxQDyv4hKygGXqBbugEhqEZTEO7Ff6F0ltLH/bt+rctEnmQV8jTImVNe/xGvDFAFdkA/MRowrW05lgAAAAASUVORK5CYII=";

        private static Texture2D s_ArrowRightTexture;

        private static string ArrowDownBase64 =
                "iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAFyGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0MzUyLCAyMDIwLzAxLzMwLTE1OjUwOjM4ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA0LTI5VDA4OjUwOjI5LTA0OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTA0LTI5VDA4OjUwOjI5LTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wNC0yOVQwODo1MDoyOS0wNDowMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyNDEzZDRkMC0wOWI4LTIzNGItOTI5YS0xYjQyYTM4ZWYwMGEiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo1ZWM4ZmUxMC1iNDZiLTQ5NGQtODY5Mi04OGQxMDI1YzUwNzYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo5N2VhZGE3Ni0zMmU1LTI0NGMtYWY5Ny1lY2I5NzhkZDA1OWMiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5N2VhZGE3Ni0zMmU1LTI0NGMtYWY5Ny1lY2I5NzhkZDA1OWMiIHN0RXZ0OndoZW49IjIwMjAtMDQtMjlUMDg6NTA6MjktMDQ6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4xIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MjQxM2Q0ZDAtMDliOC0yMzRiLTkyOWEtMWI0MmEzOGVmMDBhIiBzdEV2dDp3aGVuPSIyMDIwLTA0LTI5VDA4OjUwOjI5LTA0OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+D8aS+AAAAFdJREFUOMu900EKACAIBED//2kLijBRS9OEzUMwWCAgImRkHL29ZIOixaEQNieCFIj/kfuJFKmDbjGO1EInTELqIQ3TkD8QxyykBjJq7ZR4SSFlmhzImwatGWjCcodPVgAAAABJRU5ErkJggg==";

        private static Texture2D s_ArrowDownTexture;
        private static GUIStyle s_NodeFoldoutStyle;

        [SerializeField]
        private NodePortReference[] _references = new NodePortReference[0];

        [SerializeField]
        private Rect[] _rects = new Rect[0];

        public NodeGraph graph;
        public Node[] Highlights;
        private Func<bool> _isDocked;
        private Dictionary<Node, Vector2> _nodeSizes = new Dictionary<Node, Vector2>();
        private Vector2 _panOffset;
        private float _zoom = 1;

        /// <summary> Stores node positions for all nodePorts. </summary>
        public Dictionary<NodePort, Rect> portConnectionPoints { get; } =
            new Dictionary<NodePort, Rect>();

        private static Texture2D ArrowRightTexture {
            get {
                if (s_ArrowRightTexture == null) {
                    s_ArrowRightTexture = new Texture2D(1, 1);
                    s_ArrowRightTexture.LoadImage(Convert.FromBase64String(ArrowRightBase64));
                    s_ArrowRightTexture.Apply();
                    s_ArrowRightTexture.filterMode = FilterMode.Bilinear;
                }
                return s_ArrowRightTexture;
            }
        }

        private static Texture2D ArrowDownTexture {
            get {
                if (s_ArrowDownTexture == null) {
                    s_ArrowDownTexture = new Texture2D(1, 1);
                    s_ArrowDownTexture.LoadImage(Convert.FromBase64String(ArrowDownBase64));
                    s_ArrowDownTexture.Apply();
                    s_ArrowDownTexture.filterMode = FilterMode.Bilinear;
                }
                return s_ArrowDownTexture;
            }
        }

        private static GUIStyle NodeFoldoutStyle {
            get {
                if (s_NodeFoldoutStyle == null) {
                    s_NodeFoldoutStyle = new GUIStyle(EditorStyles.foldout);
                    s_NodeFoldoutStyle.normal.background = ArrowRightTexture;
                    s_NodeFoldoutStyle.active.background = ArrowRightTexture;
                    s_NodeFoldoutStyle.focused.background = ArrowRightTexture;
                    s_NodeFoldoutStyle.hover.background = ArrowRightTexture;
                    s_NodeFoldoutStyle.onNormal.background = ArrowDownTexture;
                    s_NodeFoldoutStyle.onActive.background = ArrowDownTexture;
                    s_NodeFoldoutStyle.onFocused.background = ArrowDownTexture;
                    s_NodeFoldoutStyle.onHover.background = ArrowDownTexture;
                    s_NodeFoldoutStyle.fixedWidth = ArrowDownTexture.width;
                    s_NodeFoldoutStyle.fixedHeight = ArrowDownTexture.height;
                    s_NodeFoldoutStyle.border = new RectOffset();
                }
                return s_NodeFoldoutStyle;
            }
        }

        private Func<bool> isDocked {
            get {
                if (_isDocked == null) _isDocked = this.GetIsDockedDelegate();
                return _isDocked;
            }
        }

        public Dictionary<Node, Vector2> nodeSizes => _nodeSizes;

        public Vector2 panOffset {
            get => _panOffset;
            set {
                _panOffset = value;
                Repaint();
            }
        }

        public float zoom {
            get => _zoom;
            set {
                _zoom = Mathf.Clamp(value, NodeEditorPreferences.GetSettings().minZoom,
                    NodeEditorPreferences.GetSettings().maxZoom);
                Repaint();
            }
        }

        private void OnEnable()
        {
            Undo.undoRedoPerformed += UndoRedoPerformed;

            // Reload portConnectionPoints if there are any
            var length = _references.Length;

            if (length == _rects.Length)
                for (var i = 0; i < length; i++) {
                    var nodePort = _references[i].GetNodePort();
                    if (nodePort != null) portConnectionPoints.Add(nodePort, _rects[i]);
                }
#if ODIN_INSPECTOR
            EditorApplication.update -= Update;
            EditorApplication.update += Update;
#endif
        }

        private void OnDisable()
        {
            Undo.undoRedoPerformed -= UndoRedoPerformed;

            // Cache portConnectionPoints before serialization starts
            var count = portConnectionPoints.Count;
            _references = new NodePortReference[count];
            _rects = new Rect[count];
            var index = 0;

            foreach (var portConnectionPoint in portConnectionPoints) {
                _references[index] = new NodePortReference(portConnectionPoint.Key);
                _rects[index] = portConnectionPoint.Value;
                index++;
            }
#if ODIN_INSPECTOR
            EditorApplication.update -= Update;
#endif
        }

        private void OnFocus()
        {
            current = this;
            ValidateGraphEditor();

            if (graphEditor != null) {
                graphEditor.OnWindowFocus();
                if (NodeEditorPreferences.GetSettings().autoSave) AssetDatabase.SaveAssets();
            }
            dragThreshold = Math.Max(1f, Screen.width / 1000f);
        }

        private void OnLostFocus()
        {
            if (graphEditor != null) graphEditor.OnWindowFocusLost();
        }

        private void UndoRedoPerformed()
        {
            Repaint();
        }

        [InitializeOnLoadMethod]
        private static void OnLoad()
        {
            Selection.selectionChanged -= OnSelectionChanged;
            Selection.selectionChanged += OnSelectionChanged;
        }

        /// <summary> Handle Selection Change events</summary>
        private static void OnSelectionChanged()
        {
            var nodeGraph = Selection.activeObject as NodeGraph;
            if (nodeGraph && !AssetDatabase.Contains(nodeGraph))
                if (NodeEditorPreferences.GetSettings().openOnCreate)
                    Open(nodeGraph);
        }

        /// <summary> Make sure the graph editor is assigned and to the right object </summary>
        private void ValidateGraphEditor()
        {
            var graphEditor = NodeGraphEditor.GetEditor(graph, this);

            if (this.graphEditor != graphEditor && graphEditor != null) {
                this.graphEditor = graphEditor;
                graphEditor.OnOpen();
            }
        }

        /// <summary> Create editor window </summary>
        public static NodeEditorWindow Init()
        {
            var w = CreateInstance<NodeEditorWindow>();
            w.titleContent = new GUIContent("xNode");
            w.wantsMouseMove = true;
            w.Show();
            return w;
        }

        public void Save()
        {
            if (AssetDatabase.Contains(graph)) {
                EditorUtility.SetDirty(graph);
                if (NodeEditorPreferences.GetSettings().autoSave) AssetDatabase.SaveAssets();
            }
            else {
                SaveAs();
            }
        }

        public void SaveAs()
        {
            var path = EditorUtility.SaveFilePanelInProject(
                "Save NodeGraph", "NewNodeGraph", "asset", "");
            if (string.IsNullOrEmpty(path)) return;
            var existingGraph = AssetDatabase.LoadAssetAtPath<NodeGraph>(path);
            if (existingGraph != null) AssetDatabase.DeleteAsset(path);
            AssetDatabase.CreateAsset(graph, path);
            EditorUtility.SetDirty(graph);
            if (NodeEditorPreferences.GetSettings().autoSave) AssetDatabase.SaveAssets();
        }

        private void DraggableWindow(int windowID)
        {
            GUI.DragWindow();
        }

        public Vector2 WindowToGridPosition(Vector2 windowPosition) =>
                (windowPosition - position.size * 0.5f - panOffset / zoom) * zoom;

        public Vector2 GridToWindowPosition(Vector2 gridPosition) =>
                position.size * 0.5f + panOffset / zoom + gridPosition / zoom;

        public Rect GridToWindowRectNoClipped(Rect gridRect)
        {
            gridRect.position = GridToWindowPositionNoClipped(gridRect.position);
            return gridRect;
        }

        public Rect GridToWindowRect(Rect gridRect)
        {
            gridRect.position = GridToWindowPosition(gridRect.position);
            gridRect.size /= zoom;
            return gridRect;
        }

        public Vector2 GridToWindowPositionNoClipped(Vector2 gridPosition)
        {
            var center = position.size * 0.5f;
            // UI Sharpness complete fix - Round final offset not panOffset
            var xOffset = Mathf.Round(center.x * zoom + (panOffset.x + gridPosition.x));
            var yOffset = Mathf.Round(center.y * zoom + (panOffset.y + gridPosition.y));
            return new Vector2(xOffset, yOffset);
        }

        public void HighlightNodes(params Node[] nodes)
        {
            Highlights = nodes.ToArray();
        }

        public void HighlightNodes(IList<Node> nodes)
        {
            Highlights = nodes.ToArray();
        }

        public static bool IsHighlighted(Node node) => current != null
                && current.Highlights != null
                && current.Highlights.Contains(node);

        public void SelectNode(Node node, bool add)
        {
            Highlights = null;

            if (add) {
                var selection = new List<Object>(Selection.objects);
                selection.Add(node);
                Selection.objects = selection.ToArray();
            }
            else {
                Selection.objects = new Object[] { node };
            }
            var nodeIndex = graph.nodes.IndexOf(node);
            var indexToMove = orderedNodeIndices.IndexOf(nodeIndex);

            if (indexToMove >= 0) {
                orderedNodeIndices.RemoveAt(indexToMove);
                orderedNodeIndices.Insert(orderedNodeIndices.Count, nodeIndex);
            }
        }

        public void DeselectNode(Node node)
        {
            var selection = new List<Object>(Selection.objects);
            selection.Remove(node);
            Selection.objects = selection.ToArray();
        }

        [OnOpenAsset(0)]
        public static bool OnOpen(int instanceID, int line)
        {
            var nodeGraph = EditorUtility.InstanceIDToObject(instanceID) as NodeGraph;

            if (nodeGraph != null) {
                Open(nodeGraph);
                return true;
            }
            return false;
        }

        /// <summary>Open the provided graph in the NodeEditor</summary>
        public static NodeEditorWindow Open(NodeGraph graph)
        {
            if (!graph) return null;
            var openNewWindow = Event.current != null
                    && (Event.current.modifiers & EventModifiers.Alt) == EventModifiers.Alt;
            var w = openNewWindow ? CreateWindow<NodeEditorWindow>("xNode")
                    : GetWindow<NodeEditorWindow>("xNode");
            w.wantsMouseMove = true;
            if (graph != w.graph && w.graph != null) NodeEditor.ClearEditors(w);
            w.titleContent = new GUIContent(graph.name);
            w.graph = graph;
            w.Focus();
            return w;
        }

        /// <summary> Repaint all open NodeEditorWindows. </summary>
        public static void RepaintAll()
        {
            var windows = Resources.FindObjectsOfTypeAll<NodeEditorWindow>();
            for (var i = 0; i < windows.Length; i++) windows[i].Repaint();
        }

        [Serializable]
        private class NodePortReference
        {
            [SerializeField]
            private Node _node;

            [SerializeField]
            private string _name;

            public NodePortReference(NodePort nodePort)
            {
                _node = nodePort.node;
                _name = nodePort.fieldName;
            }

            public NodePort GetNodePort()
            {
                if (_node == null) return null;
                return _node.GetPort(_name);
            }
        }

#if ODIN_INSPECTOR
        protected static MethodInfo s_GetTargetInfo;

        protected static bool IsOdinSelector(OdinEditorWindow window)
        {
            if (window == null) return false;
            if (s_GetTargetInfo == null)
                s_GetTargetInfo = typeof(OdinEditorWindow).GetMethod("GetTarget",
                    BindingFlags.Instance | BindingFlags.NonPublic);
            var target = s_GetTargetInfo.Invoke(window, null);
            if (target != null)
                return target.GetType().ImplementsOpenGenericClass(typeof(OdinSelector<>));
            return false;
        }

        protected OdinEditorWindow selectorWindow;
        private void Update()
        {
            // Force odin selector popups to respect zoom position
            OdinEditorWindow odin;

            if (IsOdinSelector(odin = focusedWindow as OdinEditorWindow))
                if (odin != selectorWindow) {
                    selectorWindow = odin;
                    onLateGUI += () => {
                        selectorWindow.position = new Rect(lastMousePosition + position.position,
                            odin.position.size);
                    };
                }
        }
#endif
    }
}
