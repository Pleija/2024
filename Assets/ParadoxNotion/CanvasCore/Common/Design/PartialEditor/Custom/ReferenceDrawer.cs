using System;
using Sirenix.OdinInspector.Editor;
using Sirenix.Utilities.Editor;
using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;

public class ReferenceDrawer: AssetReferenceDrawer<AssetReference>{}

public class AssetReferenceDrawer<T> : OdinValueDrawer<T>, IDisposable
    where T : AssetReference
{
    private SerializedProperty serializedProperty;
    private UnityPropertyEmitter.Handle handle;
 
    protected override void Initialize()
    {
        if (this.Property.Tree.UnitySerializedObject != null)
        {
            this.serializedProperty = this.Property.Tree.UnitySerializedObject.FindProperty(this.Property.UnityPropertyPath);
        }
 
        if (this.serializedProperty == null)
        {
            GameObject go = null;
 
            this.handle = UnityPropertyEmitter.CreateEmittedMonoBehaviourProperty(this.Property.Name, typeof(T), this.ValueEntry.ValueCount, ref go);
            this.serializedProperty = this.handle.UnityProperty;
        }
        
    }
 
    protected override void DrawPropertyLayout(GUIContent label)
    {
        if (this.serializedProperty == null)
        {
            // This won't work, hope for the best further down
            SirenixEditorGUI.ErrorMessageBox("Failed to get property for AssetReference");
            this.CallNextDrawer(label);
            return;
        }
 
        if (this.handle != null) // Emitted property preparation
        {
            for (int i = 0; i < this.ValueEntry.ValueCount; i++)
            {
                var emitted = this.handle.Objects[i] as EmittedMonoBehaviour<T>;
 
                if (emitted != null)
                {
                    emitted.SetValue(this.ValueEntry.Values[i]);
                }
            }
 
            this.serializedProperty.serializedObject.Update();
            this.serializedProperty = this.serializedProperty.serializedObject.FindProperty(this.serializedProperty.propertyPath);
        }
 
        if (this.handle == null) EditorGUI.BeginChangeCheck();
        EditorGUILayout.PropertyField(this.serializedProperty, label);
        if (this.handle == null && EditorGUI.EndChangeCheck())
        {
            this.ValueEntry.Values.ForceMarkDirty();
        }
 
        if (this.handle != null) // Emitted property post-drawing stuff
        {
            this.serializedProperty.serializedObject.ApplyModifiedPropertiesWithoutUndo();
 
            for (int i = 0; i < this.ValueEntry.ValueCount; i++)
            {
                var emitted = this.handle.Objects[i] as EmittedMonoBehaviour<T>;
 
                if (emitted != null)
                {
                    this.ValueEntry.Values[i] = emitted.GetValue();
                }
            }
        }
    }
 
    public void Dispose()
    {
        if (this.handle != null)
        {
            this.handle.Dispose();
            this.handle = null;
        }
    }
}