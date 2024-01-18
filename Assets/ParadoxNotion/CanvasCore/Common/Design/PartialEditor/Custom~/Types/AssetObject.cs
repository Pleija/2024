// using System.Collections.Generic;
// using System.Runtime.Remoting.Messaging;
// using System.Text;
// using Hefty.EditorExtension;
// using ParadoxNotion.Design;
// using UnityEditor;
// using UnityEngine;
// using UnityEngine.AddressableAssets;
//
// namespace ParadoxNotion
// {
//     public class AssetObject : ScriptableObject
//     {
//         [SerializeField]
//         AssetReference value;
//
//         public AssetReference Reference {
//             get => value;
//             set => value = this.value;
//         }
//     }
//
//     public class AssetObjectDrawer : ObjectDrawer<AssetReference>
//     {
//         private AssetObject target;
//         private SerializedObject serializedObject;
//         private SerializedProperty property;
//         private static Dictionary<int, AssetObject> cache = new Dictionary<int, AssetObject>();
//
//         public override AssetReference OnGUI(GUIContent content, AssetReference instance)
//         {
//             //Debug.Log("test");
//             if (instance != null) {
//                 if (cache.TryGetValue(instance.GetHashCode(), out var ret)) {
//                     target = ret;
//                 }
//                 else {
//                     target = cache[instance.GetHashCode()] = ScriptableObject.CreateInstance<AssetObject>();
//                     target.Reference = instance;
//                 }
//
//                 // if (target != null) {
//                 //target = ScriptableObject.CreateInstance<AssetObject>();
//                 serializedObject = new SerializedObject(target);
//                 property = serializedObject.FindProperty("value");
//
//                 if (property != null) {
//                     //target.Reference = instance;
//                     serializedObject.Update();
//                     EditorGUILayout.PropertyField(property, content, false);
//                     serializedObject.ApplyModifiedProperties();
//                     instance = target.Reference;
//                     return instance;
//                 }
//             }
//
//             //  }
//             GUILayout.Label(target.FindAllProperty());
//             GUILayout.Label($"property Reference not found: {content.text}");
//             return null;
//             //return EditorUtils.DrawEditorFieldDirect(content, instance, objectType, info) as AssetReference;
//         }
//     }
// }


