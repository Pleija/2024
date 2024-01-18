using System;
using Sirenix.OdinInspector.Editor;
using Sirenix.Utilities.Editor;
using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;

public class ReferenceDrawer : AssetReferenceDrawer<AssetReference> { }

public class AssetReferenceDrawer<T> : OdinValueDrawer<T>, IDisposable where T : AssetReference
{
    private SerializedProperty serializedProperty;
    private UnityPropertyEmitter.Handle handle;

    protected override void Initialize()
    {
        if (Property.Tree.UnitySerializedObject != null)
            serializedProperty = Property.Tree.UnitySerializedObject.FindProperty(Property.UnityPropertyPath);

        if (serializedProperty == null) {
            GameObject go = null;
            handle = UnityPropertyEmitter.CreateEmittedMonoBehaviourProperty(Property.Name, typeof(T),
                ValueEntry.ValueCount, ref go);
            serializedProperty = handle.UnityProperty;
        }
    }

    protected override void DrawPropertyLayout(GUIContent label)
    {
        if (serializedProperty == null) {
            // This won't work, hope for the best further down
            SirenixEditorGUI.ErrorMessageBox("Failed to get property for AssetReference");
            CallNextDrawer(label);
            return;
        }

        if (handle != null) // Emitted property preparation
        {
            for (var i = 0; i < ValueEntry.ValueCount; i++) {
                var emitted = handle.Objects[i] as EmittedMonoBehaviour<T>;
                if (emitted != null) emitted.SetValue(ValueEntry.Values[i]);
            }
            serializedProperty.serializedObject.Update();
            serializedProperty = serializedProperty.serializedObject.FindProperty(serializedProperty.propertyPath);
        }
        if (handle == null) EditorGUI.BeginChangeCheck();
        EditorGUILayout.PropertyField(serializedProperty, label);
        if (handle == null && EditorGUI.EndChangeCheck()) ValueEntry.Values.ForceMarkDirty();

        if (handle != null) // Emitted property post-drawing stuff
        {
            serializedProperty.serializedObject.ApplyModifiedPropertiesWithoutUndo();

            for (var i = 0; i < ValueEntry.ValueCount; i++) {
                var emitted = handle.Objects[i] as EmittedMonoBehaviour<T>;
                if (emitted != null) ValueEntry.Values[i] = emitted.GetValue();
            }
        }
    }

    public void Dispose()
    {
        if (handle != null) {
            handle.Dispose();
            handle = null;
        }
    }
}
