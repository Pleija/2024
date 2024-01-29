// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Text.RegularExpressions;
// using Sirenix.OdinInspector;
// using Sirenix.Utilities;
// using UnityEditor;
// using UnityEngine;
//
// namespace Runtime.Models
// {
//     [CreateAssetMenu(fileName = "EfTest", menuName = "Custom/EfTestModel", order = 0)]
//     public class EfTestModel : SerializedScriptableObject
//     {
//         [Serializable]
//         public class Model
//         {
//             [TableColumnWidth(22, false)]
//             [HideLabel]
//             public bool @on = true;
//
//             [ReadOnly]
//             public string name;
//
//             [ShowInInspector]
//             [TableColumnWidth(120, false)]
//             public TextAsset origin { get; set; }
//         }
//
//         [TableList]
//         public List<Model> models = new List<Model>();
//
//         [SerializeField]
//         [ValueDropdown(nameof(GenTestList))]
//         string test;
//
//         [Button]
//         void TestModel() {
//             if (!test.IsNullOrEmpty()) {
//                 Debug.Log($"Test: {test}");
//                 JsMain.NewEnv().Eval($"require('{test}')");
//             }
//         }
//
//         IEnumerable<string> GenTestList => models.Select(t => t.name);
//
//         [Button]
//         void OnEnable() {
//             #if UNITY_EDITOR
//             var dir = "slim-ef-test/";
//             AssetDatabase.FindAssets($"t:{typeof(JsxAsset).FullName}").Select(AssetDatabase.GUIDToAssetPath)
//                 .Where(t => t.Contains(dir)).ForEach(t => {
//                     var path = Regex.Match(t, dir + @"(.+)\.(x|jsx)").Captures[0].Value.ChangeExtension(".js");
//
//                     if (models.All(x => x.name != path)) models.Add(new Model() { name = path });
//
//                     var model = models.FirstOrDefault(x => t.EndsWith(x.name));
//                     if (model != null)
//                         model.origin = AssetDatabase.LoadAssetAtPath<TextAsset>($"Assets/Scripts/dist/bundle/{path}");
//                 });
//
//             models.RemoveAll(x => x.name.IsNullOrEmpty());
//             models = models.OrderBy(x => x.name).ToList();
//             #endif
//         }
//     }
// }
