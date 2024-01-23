﻿using UnityEngine;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Serialization;

namespace NodeCanvas.Framework.Internal
{
    ///<summary>Missing node types are deserialized into this on deserialization and can load back if type is found</summary>
    [DoNotList
     , Description(
         "Please resolve the MissingNode issue by either replacing the node, importing the missing node type, or refactoring the type in GraphRefactor.")]
    public sealed class MissingNode : Node, IMissingRecoverable
    {
        [SerializeField]
        private string _missingType;

        [SerializeField]
        private string _recoveryState;

        string IMissingRecoverable.missingType {
            get => _missingType;
            set => _missingType = value;
        }

        string IMissingRecoverable.recoveryState {
            get => _recoveryState;
            set => _recoveryState = value;
        }

        public override string name => "Missing Node".FormatError();
        public override System.Type outConnectionType => null;
        public override int maxInConnections => 0;
        public override int maxOutConnections => 0;
        public override bool allowAsPrime => false;
        public override bool canSelfConnect => false;
        public override Alignment2x2 commentsAlignment => Alignment2x2.Right;
        public override Alignment2x2 iconAlignment => Alignment2x2.Default;

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        protected override void DrawNodeConnections(Rect drawCanvas, bool fullDrawPass, Vector2 canvasMousePos
            , float zoomFactor)
        {
            foreach (var c in outConnections)
                UnityEditor.Handles.DrawBezier(c.sourceNode.rect.center, c.targetNode.rect.center
                    , c.sourceNode.rect.center, c.targetNode.rect.center, Color.red, Editor.StyleSheet.bezierTexture
                    , 3);
            foreach (var c in inConnections)
                UnityEditor.Handles.DrawBezier(c.sourceNode.rect.center, c.targetNode.rect.center
                    , c.sourceNode.rect.center, c.targetNode.rect.center, Color.red, Editor.StyleSheet.bezierTexture
                    , 3);
        }

        protected override void OnNodeGUI()
        {
            GUILayout.Label(ReflectionTools.FriendlyTypeName(_missingType).FormatError());
        }

        protected override void OnNodeInspectorGUI()
        {
            GUILayout.Label(_missingType.FormatError());
            GUILayout.Label(_recoveryState);
        }
#endif
    }
}
