#region
using System.Linq;
using UnityEditor;
using UnityEngine;
using XNode.NodeGroups;
using XNodeEditor.Internal;
#endregion

namespace XNodeEditor.NodeGroups
{
    [CustomNodeEditor(typeof(NodeGroup))]
    public class NodeGroupEditor : NodeEditor
    {
        private static Texture2D _corner;
        private NodeGroup _group;
        private bool isDragging;
        private Vector2 size;
        private NodeGroup group => _group != null ? _group : _group = target as NodeGroup;

        public static Texture2D corner => _corner != null ? _corner
                : _corner = Resources.Load<Texture2D>("xnode_corner");

        public override void OnBodyGUI()
        {
            var e = Event.current;

            switch (e.type) {
                case EventType.MouseDrag:
                    if (isDragging) {
                        group.width = Mathf.Max(200, (int)e.mousePosition.x + 16);
                        group.height = Mathf.Max(100, (int)e.mousePosition.y - 34);
                        NodeEditorWindow.current.Repaint();
                    }
                    break;
                case EventType.MouseDown:
                    // Ignore everything except left clicks
                    if (e.button != 0) return;

                    if (NodeEditorWindow.current.nodeSizes.TryGetValue(target, out size)) {
                        // Mouse position checking is in node local space
                        var lowerRight = new Rect(size.x - 34, size.y - 34, 30, 30);
                        if (lowerRight.Contains(e.mousePosition)) isDragging = true;
                    }
                    break;
                case EventType.MouseUp:
                    isDragging = false;

                    // Select nodes inside the group
                    if (Selection.Contains(target)) {
                        var selection = Selection.objects.ToList();
                        // Select Nodes
                        selection.AddRange(group.GetNodes());

                        // Select Reroutes
                        foreach (var node in target.graph.nodes)
                            if (node != null)
                                foreach (var port in node.Ports)
                                    for (var i = 0; i < port.ConnectionCount; i++) {
                                        var reroutes = port.GetReroutePoints(i);

                                        for (var k = 0; k < reroutes.Count; k++) {
                                            var p = reroutes[k];
                                            if (p.x < group.position.x) continue;
                                            if (p.y < group.position.y) continue;
                                            if (p.x > group.position.x + group.width) continue;
                                            if (p.y > group.position.y + group.height + 30)
                                                continue;
                                            if (NodeEditorWindow.current.selectedReroutes.Any(x =>
                                                    x.port == port
                                                    && x.connectionIndex == i
                                                    && x.pointIndex == k))
                                                continue;
                                            NodeEditorWindow.current.selectedReroutes.Add(
                                                new RerouteReference(port, i, k));
                                        }
                                    }
                            else
                                continue;
                        Selection.objects = selection.Distinct().ToArray();
                    }
                    break;
                case EventType.Repaint:
                    // Move to bottom
                    if (target.graph.nodes.IndexOf(target) != 0) {
                        target.graph.nodes.Remove(target);
                        target.graph.nodes.Insert(0, target);
                    }

                    // Add scale cursors
                    if (NodeEditorWindow.current.nodeSizes.TryGetValue(target, out size)) {
                        var lowerRight = new Rect(target.position, new Vector2(30, 30));
                        lowerRight.y += size.y - 34;
                        lowerRight.x += size.x - 34;
                        lowerRight = NodeEditorWindow.current.GridToWindowRect(lowerRight);
                        NodeEditorWindow.current.onLateGUI += () => AddMouseRect(lowerRight);
                    }
                    break;
            }

            // Control height of node
            GUILayout.Space(group.height);
            GUI.DrawTexture(new Rect(group.width - 34, group.height + 16, 24, 24), corner);
        }

        public override int GetWidth() => group.width;
        public override Color GetTint() => group.color;

        public static void AddMouseRect(Rect rect)
        {
            EditorGUIUtility.AddCursorRect(rect, MouseCursor.ResizeUpLeft);
        }
    }
}
