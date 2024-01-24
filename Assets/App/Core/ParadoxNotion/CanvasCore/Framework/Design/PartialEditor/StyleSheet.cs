#if UNITY_EDITOR

#region
using System;
using NodeCanvas.Framework;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.Editor
{
    ///<summary>Styling database (styles, icons, colors)</summary>
    public class StyleSheet : ScriptableObject
    {
        private static StyleSheet _styleSheet;

        ///----------------------------------------------------------------------------------------------
        [SerializeField]
        private Styles styles;

        [SerializeField]
        private Icons icons;

        private static StyleSheet styleSheet => _styleSheet
                ?? (_styleSheet = Resources.Load<StyleSheet>(EditorGUIUtility.isProSkin
                        ? "StyleSheet/StyleSheetDark"
                        : "StyleSheet/StyleSheetLight"));

        ///----------------------------------------------------------------------------------------------
        public static Texture2D bezierTexture => styleSheet.icons.bezierTexture;

        public static GUIStyle window => styleSheet.styles.window;
        public static GUIStyle windowShadow => styleSheet.styles.windowShadow;
        public static GUIStyle windowHighlight => styleSheet.styles.windowHighlight;
        public static GUIStyle windowHeader => styleSheet.styles.windowHeader;
        public static GUIStyle windowTitle => styleSheet.styles.windowTitle;
        public static GUIStyle button => styleSheet.styles.button;
        public static GUIStyle box => styleSheet.styles.box;
        public static GUIStyle labelOnCanvas => styleSheet.styles.labelOnCanvas;
        public static GUIStyle commentsBox => styleSheet.styles.commentsBox;
        public static GUIStyle nodePortContainer => styleSheet.styles.nodePortContainer;
        public static GUIStyle nodePortConnected => styleSheet.styles.nodePortConnected;
        public static GUIStyle nodePortEmpty => styleSheet.styles.nodePortEmpty;
        public static GUIStyle scaleArrowBR => styleSheet.styles.scaleArrowBR;
        public static GUIStyle scaleArrowTL => styleSheet.styles.scaleArrowTL;
        public static GUIStyle canvasBG => styleSheet.styles.canvasBG;
        public static GUIStyle canvasBorders => styleSheet.styles.canvasBorders;
        public static GUIStyle editorPanel => styleSheet.styles.editorPanel;
        public static GUIStyle canvasGroupHeader => styleSheet.styles.canvasGroupHeader;
        public static GUIStyle hollowBox => styleSheet.styles.hollowBox;

        ///----------------------------------------------------------------------------------------------
        public static Texture2D canvasIcon => styleSheet.icons.canvasIcon;

        public static Texture2D statusSuccess => styleSheet.icons.statusSuccess;
        public static Texture2D statusFailure => styleSheet.icons.statusFailure;
        public static Texture2D statusRunning => styleSheet.icons.statusRunning;
        public static Texture2D circle => styleSheet.icons.circle;
        public static Texture2D arrowLeft => styleSheet.icons.arrowLeft;
        public static Texture2D arrowRight => styleSheet.icons.arrowRight;
        public static Texture2D arrowTop => styleSheet.icons.arrowTop;
        public static Texture2D arrowBottom => styleSheet.icons.arrowBottom;
        public static Texture2D genericType => styleSheet.icons.genericType;
        public static Texture2D log => styleSheet.icons.log;
        public static Texture2D lens => styleSheet.icons.lens;
        public static Texture2D refactor => styleSheet.icons.refactor;
        public static Texture2D verboseLevel1 => styleSheet.icons.verboseLevel1;
        public static Texture2D verboseLevel2 => styleSheet.icons.verboseLevel2;
        public static Texture2D verboseLevel3 => styleSheet.icons.verboseLevel3;

        [ContextMenu("Lock")]
        private void Lock()
        {
            hideFlags = HideFlags.NotEditable;
        }

        [ContextMenu("UnLock")]
        private void UnLock()
        {
            hideFlags = HideFlags.None;
        }

        [InitializeOnLoadMethod]
        private static void Load()
        {
            _styleSheet = styleSheet;
        }

        ///----------------------------------------------------------------------------------------------
        ///<summary>Return an arrow based on direction vector</summary>
        public static Texture2D GetDirectionArrow(Vector2 dir)
        {
            if (dir.normalized == Vector2.left) return arrowLeft;
            if (dir.normalized == Vector2.right) return arrowRight;
            if (dir.normalized == Vector2.up) return arrowTop;
            if (dir.normalized == Vector2.down) return arrowBottom;
            return circle;
        }

        ///<summary>Return icon based on status</summary>
        public static Texture2D GetStatusIcon(Status status)
        {
            if (status == Status.Success) return statusSuccess;
            if (status == Status.Failure) return statusFailure;
            if (status == Status.Running) return statusRunning;
            return null;
        }

        ///<summary>Return color based on status</summary>
        public static Color GetStatusColor(Status status)
        {
            switch (status) {
                case Status.Failure:  return new Color(1.0f, 0.3f, 0.3f);
                case Status.Success:  return new Color(0.4f, 0.7f, 0.2f);
                case Status.Running:  return Color.yellow;
                case Status.Resting:  return new Color(0.7f, 0.7f, 1f, 0.8f);
                case Status.Error:    return Color.red;
                case Status.Optional: return Color.grey;
            }
            return Color.white;
        }

        ///----------------------------------------------------------------------------------------------
        [Serializable]
        public class Styles
        {
            public GUIStyle window;
            public GUIStyle windowShadow;
            public GUIStyle windowHighlight;
            public GUIStyle windowHeader;
            public GUIStyle windowTitle;
            public GUIStyle button;
            public GUIStyle box;
            public GUIStyle labelOnCanvas;
            public GUIStyle commentsBox;
            public GUIStyle nodePortContainer;
            public GUIStyle nodePortConnected;
            public GUIStyle nodePortEmpty;
            public GUIStyle scaleArrowBR;
            public GUIStyle scaleArrowTL;
            public GUIStyle canvasBG;
            public GUIStyle canvasBorders;
            public GUIStyle editorPanel;
            public GUIStyle canvasGroupHeader;
            public GUIStyle hollowBox;
        }

        [Serializable]
        public class Icons
        {
            public Texture2D bezierTexture;

            [Header("Colorized")]
            public Texture2D statusSuccess;

            public Texture2D statusFailure;
            public Texture2D statusRunning;
            public Texture2D circle;
            public Texture2D arrowLeft;
            public Texture2D arrowRight;
            public Texture2D arrowTop;
            public Texture2D arrowBottom;
            public Texture2D genericType;

            [Header("Fixed")]
            public Texture2D canvasIcon;

            public Texture2D log;
            public Texture2D lens;
            public Texture2D refactor;
            public Texture2D verboseLevel1;
            public Texture2D verboseLevel2;
            public Texture2D verboseLevel3;
        }
    }
}

#endif
