#if UNITY_EDITOR

#region
using System;
using UnityEditor;
using UnityEngine;
#endregion

#if SLATE_USE_FRAMECAPTURER
using Slate.UTJ.FrameCapturer;
#endif

namespace Slate
{
    ///<summary>SLATE editor preferences</summary>
    public static class Prefs
    {
        [Serializable]
        public enum KeyframesStyle { PerTangentMode, AlwaysDiamond }

        [Serializable]
        public enum TimeStepMode { Seconds, Frames }

        public const string USE_HDRP_DEFINE = "SLATE_USE_HDRP";
        public const string USE_URP_DEFINE = "SLATE_USE_URP";
        public const string USE_POSTSTACK_DEFINE = "SLATE_USE_POSTSTACK";
        public const string USE_EXPRESSIONS_DEFINE = "SLATE_USE_EXPRESSIONS";
        public const string USE_FRAMECAPTURER_DEFINE = "SLATE_USE_FRAMECAPTURER";
        private static SerializedData _data;
        public static float[] snapIntervals = { 0.001f, 0.01f, 0.1f };
        public static int[] frameRates = { 24, 30, 60 };

        private static SerializedData data {
            get {
                if (_data == null) {
                    _data = JsonUtility.FromJson<SerializedData>(
                        EditorPrefs.GetString("Slate.EditorPreferences"));
                    if (_data == null) _data = new SerializedData();
                }
                return _data;
            }
        }

        public static bool showTransforms {
            get => data.showTransforms;
            set {
                if (data.showTransforms != value) {
                    data.showTransforms = value;
                    Save();
                }
            }
        }

        public static bool compactMode {
            get => data.compactMode;
            set {
                if (data.compactMode != value) {
                    data.compactMode = value;
                    Save();
                }
            }
        }

        public static float gizmosLightness {
            get => data.gizmosLightness;
            set {
                if (data.gizmosLightness != value) {
                    data.gizmosLightness = value;
                    Save();
                }
            }
        }

        public static Color gizmosColor => new Color(data.gizmosLightness, data.gizmosLightness,
            data.gizmosLightness);

        public static bool showShotThumbnails {
            get => data.showShotThumbnails;
            set {
                if (data.showShotThumbnails != value) {
                    data.showShotThumbnails = value;
                    Save();
                }
            }
        }

        public static bool showDopesheetKeyValues {
            get => data.showDopesheetKeyValues;
            set {
                if (data.showDopesheetKeyValues != value) {
                    data.showDopesheetKeyValues = value;
                    Save();
                }
            }
        }

        public static KeyframesStyle keyframesStyle {
            get => data.keyframesStyle;
            set {
                if (data.keyframesStyle != value) {
                    data.keyframesStyle = value;
                    Save();
                }
            }
        }

        public static bool scrollWheelZooms {
            get => data.scrollWheelZooms;
            set {
                if (data.scrollWheelZooms != value) {
                    data.scrollWheelZooms = value;
                    Save();
                }
            }
        }

        public static bool showDescriptions {
            get => data.showDescriptions;
            set {
                if (data.showDescriptions != value) {
                    data.showDescriptions = value;
                    Save();
                }
            }
        }

        public static Color motionPathsColor {
            get => data.motionPathsColor;
            set {
                if (data.motionPathsColor != value) {
                    data.motionPathsColor = value;
                    Save();
                }
            }
        }

        public static int thumbnailsRefreshInterval {
            get => data.thumbnailsRefreshInterval;
            set {
                if (data.thumbnailsRefreshInterval != value) {
                    data.thumbnailsRefreshInterval = value;
                    Save();
                }
            }
        }

        public static bool lockHorizontalCurveEditing {
            get => data.lockHorizontalCurveEditing;
            set {
                if (data.lockHorizontalCurveEditing != value) {
                    data.lockHorizontalCurveEditing = value;
                    Save();
                }
            }
        }

        public static TangentMode defaultTangentMode {
            get => data.defaultTangentMode;
            set {
                if (data.defaultTangentMode != value) {
                    data.defaultTangentMode = value;
                    Save();
                }
            }
        }

        public static RenderSettings renderSettings {
            get => data.renderSettings;
            set {
                data.renderSettings = value;
                Save();
            }
        }

        public static bool autoCleanKeysOffRange {
            get => data.autoCleanKeysOffRange;
            set {
                if (data.autoCleanKeysOffRange != value) {
                    data.autoCleanKeysOffRange = value;
                    Save();
                }
            }
        }

        public static bool autoFirstKey {
            get => data.autoFirstKey;
            set {
                if (data.autoFirstKey != value) {
                    data.autoFirstKey = value;
                    Save();
                }
            }
        }

        public static float trackListLeftMargin {
            get => data.trackListLeftMargin;
            set {
                if (data.trackListLeftMargin != value) {
                    data.trackListLeftMargin = value;
                    Save();
                }
            }
        }

        public static bool autoCreateDirectorCamera {
            get => data.autoCreateDirectorCamera;
            set {
                if (data.autoCreateDirectorCamera != value) {
                    data.autoCreateDirectorCamera = value;
                    Save();
                }
            }
        }

        public static bool autoKey {
            get => data.autoKey;
            set {
                if (data.autoKey != value) {
                    data.autoKey = value;
                    Save();
                }
            }
        }

        public static bool magnetSnapping {
            get => data.magnetSnapping;
            set {
                if (data.magnetSnapping != value) {
                    data.magnetSnapping = value;
                    Save();
                }
            }
        }

        public static bool rippleMode {
            get => data.rippleMode;
            set {
                if (data.rippleMode != value) {
                    data.rippleMode = value;
                    Save();
                }
            }
        }

        public static bool retimeMode {
            get => data.retimeMode;
            set {
                if (data.retimeMode != value) {
                    data.retimeMode = value;
                    Save();
                }
            }
        }

        public static TimeStepMode timeStepMode {
            get => data.timeStepMode;
            set {
                if (data.timeStepMode != value) {
                    data.timeStepMode = value;
                    frameRate = value == TimeStepMode.Frames ? 30 : 10;
                    Save();
                }
            }
        }

        public static int frameRate {
            get => data.frameRate;
            set {
                if (data.frameRate != value) {
                    data.frameRate = value;
                    snapInterval = 1f / value;
                    Save();
                }
            }
        }

        public static float snapInterval {
            get => Mathf.Max(data.snapInterval, 0.001f);
            set {
                if (data.snapInterval != value) {
                    data.snapInterval = Mathf.Max(value, 0.001f);
                    Save();
                }
            }
        }

        private static void Save()
        {
            EditorPrefs.SetString("Slate.EditorPreferences", JsonUtility.ToJson(data));
        }

        [Serializable]
        private class SerializedData
        {
            public bool showTransforms;
            public bool compactMode;
            public TimeStepMode timeStepMode = TimeStepMode.Seconds;
            public float snapInterval = 0.1f;
            public int frameRate = 30;
            public bool lockHorizontalCurveEditing = true;
            public bool showDopesheetKeyValues = true;
            public bool autoFirstKey;
            public bool autoCleanKeysOffRange;
            public TangentMode defaultTangentMode = TangentMode.Smooth;
            public KeyframesStyle keyframesStyle = KeyframesStyle.PerTangentMode;
            public bool showShotThumbnails = true;
            public int thumbnailsRefreshInterval = 30;
            public bool scrollWheelZooms = true;
            public bool showDescriptions = true;
            public float gizmosLightness;
            public Color motionPathsColor = Color.black;
            public RenderSettings renderSettings = new RenderSettings();
            public float trackListLeftMargin = 280f;
            public bool autoCreateDirectorCamera = true;
            public bool autoKey = true;
            public bool magnetSnapping = true;
            public bool rippleMode;
            public bool retimeMode;
        }

        [Serializable]
        public class RenderSettings
        {
            public enum FileNameMode { UseCutsceneName, SpecifyFileName }
#if SLATE_USE_FRAMECAPTURER
            public MovieEncoder.Type renderFormat = MovieEncoder.Type.PNG;
            public string folderName = "SlateRenders";
            public FileNameMode fileNameMode = FileNameMode.UseCutsceneName;
            public string fileName = "MyRender";
            public int framerate = 30;
            public bool renderPasses = false;
            public bool captureAudio = false;
#endif
        }
    }
}

#endif
