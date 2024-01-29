using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using MoreTags;
using Newtonsoft.Json;
using Runtime.Extensions;
using Sirenix.Utilities;
using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.Callbacks;
#endif

namespace Runtime.Enums
{
    [AttributeUsage(AttributeTargets.All, AllowMultiple = true)]
    public class IdAttribute : Attribute
    {
        public string name;
        public object id;

        public IdAttribute(object name)
        {
            id = name;
            this.name = name is Enum @enum ? @enum.FullName() : "${name}";
        }

        static void Add<T>() where T : Enum
        {
            TagSystem.AddTag(Enum.GetValues(typeof(T)).Cast<T>().Select(t => t.FullName().ToTagName()).ToArray());

            // TagSystem.AllTags().Select(t => t.Contains(".") ? t : $"Def.{t}").ToArray();
        }

#if UNITY_EDITOR
        [DidReloadScripts]
        static void Reload()
        {
            Add<Id>();
            Add<It>();
            Add<On>();
            Add<Ui>();

            var data = ScriptableObject.CreateInstance<TagJsonStorage>();
            TagSystem.AllTags().OrderBy(x => x).ForEach(t => {
                t = t.AsTagName();
                var p = t.Split(new[] { "." }, StringSplitOptions.RemoveEmptyEntries);
                var name = p[0];
                var value = p.Length == 1 ? $"Tag.{t}" : t;
                switch (name) {
                    case nameof(Id):
                        data.Id[p[1]] = value;
                        break;
                    case nameof(It):
                        data.It[p[1]] = value;
                        break;
                    case nameof(On):
                        data.On[p[1]] = value;
                        break;
                    case nameof(Ui):
                        data.Ui[p[1]] = value;
                        break;
                    default:
                        data.Tag[value.Replace("Tag.", "").Replace(".", "_")] = value;
                        break;
                }
            });
            var json = JsonConvert.SerializeObject(data, Formatting.Indented);
            var path = "Assets/Typescript/src/main/id.json";
            path.CreateDirFromFilePath();
            var content = File.Exists(path) ? File.ReadAllText(path) : string.Empty;
            if (json != content) {
                Debug.Log(json);
                File.WriteAllText(path, json);
                TagPreset.AutoClass();
                AssetDatabase.Refresh();
            }
        }
#endif
    }

    [Serializable]
    public class TagJsonStorage : SingletonData<TagJsonStorage>
    {
        /*[NonSerialized]*/
        protected new string name { get; set; }

        public SortedList<string, string>  Tag = new SortedList<string, string>();
        public SortedList<string, string> Id = new SortedList<string, string>();
        public SortedList<string, string> On = new SortedList<string, string>();
        public SortedList<string, string> It = new SortedList<string, string>();
        public SortedList<string, string> Ui = new SortedList<string, string>();
    }
}
