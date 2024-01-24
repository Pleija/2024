#if UNITY_EDITOR

#region
using UnityEditor;
using UnityEngine;
#endregion

namespace ParadoxNotion.Design
{
    ///<summary>Common Styles Database</summary>
    public static class Styles
    {
        private static GUIStyle _centerLabel;
        private static GUIStyle _topCenterLabel;
        private static GUIStyle _leftLabel;
        private static GUIStyle _rightLabel;
        private static GUIStyle _topLeftLabel;
        private static GUIStyle _topRight;
        private static GUIStyle _bottomCenter;

        ///----------------------------------------------------------------------------------------------
        private static GUIStyle _portContentImage;

        private static GUIStyle _proxyRightContentLabel;
        private static GUIStyle _proxyLeftContentLabel;

        ///----------------------------------------------------------------------------------------------
        private static GUIStyle _wrapTextArea;

        ///----------------------------------------------------------------------------------------------
        private static GUIStyle _roundedBox;

        private static GUIStyle _buttonLeft;
        private static GUIStyle _buttonMid;
        private static GUIStyle _buttonRight;
        private static GUIStyle _highlightBox;
        private static GUIStyle _toolbarSearchField;
        private static GUIStyle _toolbarSearchButton;
        private static GUIStyle _shadowedBackground;

        public static GUIStyle centerLabel {
            get {
                if (_centerLabel == null) {
                    _centerLabel = new GUIStyle(GUI.skin.label);
                    _centerLabel.richText = true;
                    _centerLabel.fontSize = 11;
                    _centerLabel.alignment = TextAnchor.MiddleCenter;
                }
                return _centerLabel;
            }
        }

        public static GUIStyle topCenterLabel {
            get {
                if (_topCenterLabel == null) {
                    _topCenterLabel = new GUIStyle(GUI.skin.label);
                    _topCenterLabel.richText = true;
                    _topCenterLabel.fontSize = 11;
                    _topCenterLabel.alignment = TextAnchor.UpperCenter;
                }
                return _topCenterLabel;
            }
        }

        public static GUIStyle leftLabel {
            get {
                if (_leftLabel == null) {
                    _leftLabel = new GUIStyle(GUI.skin.label);
                    _leftLabel.richText = true;
                    _leftLabel.fontSize = 11;
                    _leftLabel.alignment = TextAnchor.MiddleLeft;
                    _leftLabel.padding.right = 6;
                }
                return _leftLabel;
            }
        }

        public static GUIStyle rightLabel {
            get {
                if (_rightLabel == null) {
                    _rightLabel = new GUIStyle(GUI.skin.label);
                    _rightLabel.richText = true;
                    _rightLabel.fontSize = 11;
                    _rightLabel.alignment = TextAnchor.MiddleRight;
                    _rightLabel.padding.left = 6;
                }
                return _rightLabel;
            }
        }

        public static GUIStyle topLeftLabel {
            get {
                if (_topLeftLabel == null) {
                    _topLeftLabel = new GUIStyle(GUI.skin.label);
                    _topLeftLabel.richText = true;
                    _topLeftLabel.fontSize = 11;
                    _topLeftLabel.alignment = TextAnchor.UpperLeft;
                    _topLeftLabel.padding.right = 6;
                }
                return _topLeftLabel;
            }
        }

        public static GUIStyle topRightLabel {
            get {
                if (_topRight == null) {
                    _topRight = new GUIStyle(GUI.skin.label);
                    _topRight.richText = true;
                    _topRight.fontSize = 11;
                    _topRight.alignment = TextAnchor.UpperRight;
                    _topRight.padding.left = 6;
                }
                return _topRight;
            }
        }

        public static GUIStyle bottomCenterLabel {
            get {
                if (_bottomCenter == null) {
                    _bottomCenter = new GUIStyle(GUI.skin.label);
                    _bottomCenter.richText = true;
                    _bottomCenter.fontSize = 11;
                    _bottomCenter.alignment = TextAnchor.LowerCenter;
                }
                return _bottomCenter;
            }
        }

        public static GUIStyle proxyContentImage {
            get {
                if (_portContentImage == null) {
                    _portContentImage = new GUIStyle(GUI.skin.label);
                    _portContentImage.alignment = TextAnchor.MiddleCenter;
                    _portContentImage.padding = new RectOffset(0, 0, _portContentImage.padding.top,
                        _portContentImage.padding.bottom);
                    _portContentImage.margin = new RectOffset(0, 0, _portContentImage.margin.top,
                        _portContentImage.margin.bottom);
                }
                return _portContentImage;
            }
        }

        public static GUIStyle proxyRightContentLabel {
            get {
                if (_proxyRightContentLabel == null) {
                    _proxyRightContentLabel = new GUIStyle(rightLabel);
                    _proxyRightContentLabel.margin = new RectOffset(0, 0,
                        _proxyRightContentLabel.margin.top,
                        _proxyRightContentLabel.margin.bottom);
                    _proxyRightContentLabel.padding = new RectOffset(8, 0,
                        _proxyRightContentLabel.padding.top,
                        _proxyRightContentLabel.padding.bottom);
                }
                return _proxyRightContentLabel;
            }
        }

        public static GUIStyle proxyLeftContentLabel {
            get {
                if (_proxyLeftContentLabel == null) {
                    _proxyLeftContentLabel = new GUIStyle(leftLabel);
                    _proxyLeftContentLabel.margin = new RectOffset(0, 0,
                        _proxyLeftContentLabel.margin.top,
                        _proxyLeftContentLabel.margin.bottom);
                    _proxyLeftContentLabel.padding = new RectOffset(0, 8,
                        _proxyLeftContentLabel.padding.top,
                        _proxyLeftContentLabel.padding.bottom);
                }
                return _proxyLeftContentLabel;
            }
        }

        public static GUIStyle wrapTextArea {
            get {
                if (_wrapTextArea == null) {
                    _wrapTextArea = new GUIStyle(GUI.skin.textArea);
                    _wrapTextArea.wordWrap = true;
                }
                return _wrapTextArea;
            }
        }

        public static GUIStyle roundedBox {
            get {
                if (_roundedBox != null) return _roundedBox;
                _roundedBox = new GUIStyle("ShurikenEffectBg");
                if (!EditorGUIUtility.isProSkin) _roundedBox.normal.background = null;
                return _roundedBox;
            }
        }

        public static GUIStyle buttonLeft {
#if UNITY_2019_3_OR_NEWER
            get { return _buttonLeft ?? (_buttonLeft = new GUIStyle("AppCommandLeft")); }
#else
            get { return _buttonLeft ?? (_buttonLeft = new GUIStyle((GUIStyle)"ButtonLeft")); }
#endif
        }

        public static GUIStyle buttonMid {
#if UNITY_2019_3_OR_NEWER
            get { return _buttonMid ?? (_buttonMid = new GUIStyle("AppCommandMid")); }
#else
            get { return _buttonMid ?? (_buttonMid = new GUIStyle((GUIStyle)"ButtonMid")); }
#endif
        }

        public static GUIStyle buttonRight {
#if UNITY_2019_3_OR_NEWER
            get { return _buttonRight ?? (_buttonRight = new GUIStyle("AppCommandRight")); }
#else
            get { return _buttonRight ?? (_buttonRight = new GUIStyle((GUIStyle)"ButtonRight")); }
#endif
        }

        public static GUIStyle highlightBox => _highlightBox
                ?? (_highlightBox = new GUIStyle("LightmapEditorSelectedHighlight"));

        public static GUIStyle toolbarSearchTextField {
#if UNITY_2022_3_OR_NEWER
            get {
                return _toolbarSearchField
                        ?? (_toolbarSearchField =
                                new GUIStyle((GUIStyle)"ToolbarSearchTextField"));
            }
#else
            get {
                return _toolbarSearchField
                        ?? (_toolbarSearchField = new GUIStyle("ToolbarSeachTextField"));
            }
#endif
        }

        public static GUIStyle toolbarSearchCancelButton {
#if UNITY_2022_3_OR_NEWER
            get {
                return _toolbarSearchButton
                        ?? (_toolbarSearchButton =
                                new GUIStyle((GUIStyle)"ToolbarSearchCancelButton"));
            }
#else
            get {
                return _toolbarSearchButton
                        ?? (_toolbarSearchButton = new GUIStyle("ToolbarSeachCancelButton"));
            }
#endif
        }

        public static GUIStyle shadowedBackground => _shadowedBackground
                ?? (_shadowedBackground = new GUIStyle("CurveEditorBackground"));

        ///----------------------------------------------------------------------------------------------
        ///<summary>Same as box, but saves me the trouble of writing string.empty all the time</summary>
        public static void Draw(Rect position, GUIStyle style)
        {
            GUI.Box(position, string.Empty, style);
        }
    }
}

#endif
