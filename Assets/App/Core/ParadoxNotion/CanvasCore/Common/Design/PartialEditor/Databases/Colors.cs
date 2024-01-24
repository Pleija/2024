#if UNITY_EDITOR

#region
using System;
using UnityEditor;
using UnityEngine;
#endregion

namespace ParadoxNotion.Design
{
    [InitializeOnLoad]
    public static class Colors
    {
        public const string HEX_LIGHT = "#d2d2d2";
        public const string HEX_DARK = "#333333";

        static Colors()
        {
            Load();
        }

        public static Color lightOrange { get; private set; }
        public static Color lightBlue { get; private set; }
        public static Color lightRed { get; private set; }
        public static Color prefabOverrideColor { get; private set; }

        [InitializeOnLoadMethod]
        private static void Load()
        {
            lightOrange = EditorGUIUtility.isProSkin ? new Color(1, 0.9f, 0.4f) : Color.white;
            lightBlue = EditorGUIUtility.isProSkin ? new Color(0.8f, 0.8f, 1) : Color.white;
            lightRed = EditorGUIUtility.isProSkin ? new Color(1, 0.5f, 0.5f, 0.8f) : Color.white;
            prefabOverrideColor = new Color(0.05f, 0.5f, 0.75f, 1f);
        }

        ///----------------------------------------------------------------------------------------------
        ///<summary>A greyscale color</summary>
        public static Color Grey(float value) => new Color(value, value, value);

        ///----------------------------------------------------------------------------------------------
        ///<summary>Return a color for a type.</summary>
        public static Color GetTypeColor(Type type) => TypePrefs.GetTypeColor(type);

        ///<summary>Return a string hex color for a type.</summary>
        public static string GetTypeHexColor(Type type) => TypePrefs.GetTypeHexColor(type);
    }
}

#endif
