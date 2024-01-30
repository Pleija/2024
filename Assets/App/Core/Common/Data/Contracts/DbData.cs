using System;
using Sirenix.OdinInspector;
using Sirenix.Serialization;
using Sirenix.Utilities.Editor;
using SqlCipher4Unity3D.SQLite.Attribute;
using UnityEditor;
using UnityEngine;
// using SQLite.Attributes;

namespace Data
{
    [Serializable]
    [ShowOdinSerializedPropertiesInInspector]
    public class DbData : SerializedScriptableObject, IData
    {
        [SerializeField]
        [TableColumnWidth(2)]
        protected int m_Id;

        [AutoIncrement]
        [PrimaryKey]
        public int Id {
            get => m_Id;
            set => m_Id = value;
        }

        [OdinSerialize]
        [HideInInspector]
        [ReadOnly]
        [CustomValueDrawer(nameof(FriendlyTime))]
        [TableColumnWidth(0)]
        public long Created { get; set; } = Core.TimeStamp();

        [OdinSerialize]
        [HideInInspector]
        [ReadOnly]
        [CustomValueDrawer(nameof(FriendlyTime))]
        [TableColumnWidth(0)]
        public long Updated { get; set; } = Core.TimeStamp();

        long FriendlyTime(long timestamp, GUIContent label) {
            #if UNITY_EDITOR
            SirenixEditorGUI.BeginBox();

            //callNextDrawer(label);
            if (timestamp > 0) EditorGUILayout.HelpBox(Core.RelativeFriendlyTime(timestamp), MessageType.None);

            var result = EditorGUILayout.LongField(label ?? new GUIContent(""), timestamp);

            //var result = EditorGUILayout.Slider(value, this.From, this.To);
            SirenixEditorGUI.EndBox();
            return result;
            #endif
            return default;
        }
    }
}
