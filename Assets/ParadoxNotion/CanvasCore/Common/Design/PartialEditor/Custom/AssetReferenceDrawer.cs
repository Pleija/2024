using System;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
using UnityEngine.AddressableAssets;

namespace ParadoxNotion
{
    public abstract class AssetReferenceDrawer<T, T2> : ObjectDrawer<T> where T2 : BaseObject<T, T2>
    {
        private T2 target;
        private SerializedObject serializedObject;
        private SerializedProperty property;

        public override T OnGUI(GUIContent content, T instance)
        {
            //Debug.Log("test");
            if (target == null) {
                target = ScriptableObject.CreateInstance<T2>();
                serializedObject ??= new SerializedObject(target);
                target.Reference = instance;
                property = serializedObject.FindProperty("Reference");
            }
            serializedObject.Update();
            EditorGUILayout.PropertyField(property, content,false);
            serializedObject.ApplyModifiedProperties();
            return target.Reference;
            //return EditorUtils.DrawEditorFieldDirect(content, instance, objectType, info) as AssetReference;
        }
    }
}
