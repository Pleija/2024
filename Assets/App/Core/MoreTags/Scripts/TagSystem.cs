#region
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using Runtime;
using Runtime.Extensions;
using Sirenix.Utilities;
using TMPro;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using UnityEngine.UI.Extensions;
using Object = UnityEngine.Object;
#endregion

namespace MoreTags
{
    public abstract class TagPattern
    {
        public abstract GameObject GameObject();
        public abstract GameObject[] GameObjects();
        public abstract int Count();
        public abstract TagPattern And();
        public abstract TagPattern Or();
        public abstract TagPattern Exclude();
        public abstract TagPattern And(TagPattern pattern);
        public abstract TagPattern Or(TagPattern pattern);
        public abstract TagPattern Exclude(TagPattern pattern);
        public abstract TagPattern Combine(TagPattern pattern);
        public abstract TagPattern All();
        public abstract TagPattern With(string tag);
        public abstract TagPattern Both(params string[] tags);
        public abstract TagPattern Either(params string[] tags);

        public static implicit operator TagPattern(string pattern) =>
            TagHelper.StringToPattern(pattern);

        public static TagPattern operator &(TagPattern a, TagPattern b) => a.And(b);
        public static TagPattern operator |(TagPattern a, TagPattern b) => a.Or(b);
        public static TagPattern operator -(TagPattern a, TagPattern b) => a.Exclude(b);
        public static TagPattern operator -(TagPattern a) => TagSystem.pattern.All().Exclude(a);
        public static TagPattern operator &(TagName a, TagPattern b) => (TagPattern)a & b;
        public static TagPattern operator |(TagName a, TagPattern b) => (TagPattern)a | b;
        public static TagPattern operator -(TagName a, TagPattern b) => (TagPattern)a - b;
    }

    public class TagTableData
    {
        // public Color color;
        // public GameObject[] gameObjects;
        public Color color = Color.white;
        public int cost = 0;
        public bool enable = false;
        public HashSet<GameObject> gameObjects = new HashSet<GameObject>();
        public int number = 0;

        //public string name;
        public string value = "";
    }

    public class TagGraph
    {
        public class Item
        {
            public readonly Dictionary<object, Action<Tags>> actions =
                new Dictionary<object, Action<Tags>>();

            public Action<Tags> this[object index] {
                get => index != null && actions.TryGetValue(index, out var value) ? value : null;
                set => actions[index] = value;
            }

            public bool Clear()
            {
                actions.Keys.ToArray().Where(x => x == null).ForEach(x => actions.Remove(x));
                return !actions.Any();
            }

            public void Invoke(Tags component)
            {
                actions.Where(x => x.Key != null && (!(x.Key is MonoBehaviour mb) || mb.enabled))
                    .ForEach(t => t.Value?.Invoke(component));
            }
        }

        public readonly HashSet<GameObject> caches = new HashSet<GameObject>();
        public readonly Item onAdd = new Item();
        public readonly Item onEnable = new Item();
        public readonly Item onDisable = new Item();
        public readonly Item onRemove = new Item();
        public readonly Item onUpdate = new Item();

        public bool Clear()
        {
            var add = onAdd.Clear();
            var remove = onRemove.Clear();
            var update = onUpdate.Clear();
            var enable = onEnable.Clear();
            var disable = onDisable.Clear();
            return add && remove && update && enable && disable;
        }
    }

    public static class TagSystem
    {
        [RuntimeInitializeOnLoadMethod]
        public static void ClearGroupsOnSceneLoad()
        {
            SceneManager.sceneLoaded += (scene, mode) => {
                ClearGroups();
            };
        }

        public static void ClearGroups()
        {
            Groups.Keys.ForEach(k => {
                if (Groups[k].Clear()) Groups.Remove(k);
            });
        }

        public static readonly Dictionary<HashSet<string>, TagGraph> Groups =
            new Dictionary<HashSet<string>, TagGraph>(HashSet<string>.CreateSetComparer());

        public static void AddGroup(Action<TagGraph> action, params string[] tags)
        {
            if (!tags.Any()) return;
            var hashset = new HashSet<string>(tags);

            if (!Groups.TryGetValue(hashset, out var item)) {
                item = Groups[hashset] = new TagGraph();
            }
            action?.Invoke(item);
        }

        public static void CheckGroup(this GameObject gameObject,
            Action<TagGraph> action = null)
        {
            if (!gameObject.TryGetComponent<Tags>(out var component) || !component.tags.Any())
                return;
            // var tags = new HashSet<string>(component.tags);
            Groups.Where(t => component.tags.Any(t.Key.Contains))
                .ForEach(t => {
                    action?.Invoke(t.Value);
                });
        }

        private static SortedDictionary<string, TagTableData> s_TagTable =
            new SortedDictionary<string, TagTableData>();

        private static GameObject[] s_SearchFrom;
        public static TagPattern pattern => new TagPatternImpl();
        private static TagManager s_TagManager => TagManager.self;

        public static void Reset()
        {
            s_TagTable.Clear();
        }

        public static void BeforeSerialize(ref List<TagData> tags /*, Scene scene*/)
        {
            var origin = tags;
            tags = s_TagTable.Select(kv => new TagData {
                    name = kv.Key, color = kv.Value.color, value = kv.Value.value,
                    cost = kv.Value.cost,
                    enable = kv.Value.enable, number = kv.Value.number,
                    //gameObjects = kv.Value.gameObjects.ToArray(), //.Where(go => go != null && go.scene == scene)
                    //     .ToArray()
                })
                .Where(x => origin.All(t => t.name != x.name))
                .Union(tags)
                .ToList();
            //Debug.Log("[TagSystem] Save");
        }

        public static void LoadDataToTable(List<TagData> tags)
        {
            foreach (var data in tags) {
                var list = data.gameObjects;
                if (s_TagTable.ContainsKey(data.name))
                    list = s_TagTable[data.name].gameObjects.Union(list).ToArray();
                else
                    s_TagTable[data.name] = new TagTableData();
                s_TagTable[data.name].color = data.color;
                s_TagTable[data.name].gameObjects = new HashSet<GameObject>(list);
            }
            //Debug.Log("[TagSystem] Load");
        }

        public static void CheckTagManager(Scene scene)
        {
            // if (s_TagManager != null) return;
            // if (!scene.isLoaded) return;
            // var manager = Object.FindObjectsOfType<TagManager>().Where(tm => tm.gameObject.scene == scene);
            // s_TagManager = manager.FirstOrDefault();
            // if (s_TagManager == null)
            // {
            //     var go = new GameObject("Tag Manager");
            //     SceneManager.MoveGameObjectToScene(go, scene);
            //     go.AddComponent<TagManager>();
            // }
        }

        public static Tags CheckGameObjectTag(GameObject go)
        {
            var tags = go.GetComponent<Tags>();
            if (tags == null) tags = go.AddComponent<Tags>();
            return tags;
        }

        public static void RemoveUnusedTag()
        {
            RemoveNullGameObject();
            var remove = s_TagTable.Where(kv => !s_TagTable[kv.Key].gameObjects.Any())
                .Select(kv => kv.Key)
                .ToArray();
            foreach (var key in remove) s_TagTable.Remove(key);
        }

        public static void RemoveNullGameObject()
        {
            foreach (var data in s_TagTable) data.Value.gameObjects.RemoveWhere(go => go == null);
        }

        public static void SearchFrom(IEnumerable<GameObject> list = null)
        {
            s_SearchFrom = list == null ? null : list.ToArray();
        }

        public static void AddTag(params string[] tags)
        {
            s_TagManager.AddTag(tags);
            foreach (var tag in tags)
                if (!s_TagTable.ContainsKey(tag))
                    s_TagTable.Add(tag, new TagTableData());
        }

        public static void RemoveTag(params string[] tags)
        {
            s_TagManager.RemoveTag(tags);
            foreach (var tag in tags)
                if (s_TagTable.ContainsKey(tag))
                    s_TagTable.Remove(tag);
        }

        public static void RenameTag(string old, string tag)
        {
            if (string.IsNullOrEmpty(tag)) return;
            if (!s_TagTable.ContainsKey(old)) return;
            if (s_TagTable.ContainsKey(tag)) return;
            s_TagTable[tag] = s_TagTable[old];
            s_TagTable.Remove(old);
            s_TagManager.RenameTag(old, tag);
        }

        public static void SetTagColor(string tag, Color col)
        {
            if (!s_TagTable.ContainsKey(tag)) AddTag(tag);
            s_TagTable[tag].color = col;
        }

        public static Color GetTagColor(string tag)
        {
            if (!s_TagTable.ContainsKey(tag)) AddTag(tag);
            return s_TagTable[tag].color;
        }

        public static void AddGameObjectTag(GameObject go, params string[] tags)
        {
            CheckTagManager(go.scene);
            AddTag(tags);
            foreach (var tag in tags) s_TagTable[tag].gameObjects.Add(go);
            CheckGameObjectTag(go).AddTags(tags);
        }

        public static void RemoveGameObjectTag(GameObject go, params string[] tags)
        {
            CheckTagManager(go.scene);
            foreach (var tag in tags)
                if (s_TagTable.ContainsKey(tag))
                    s_TagTable[tag].gameObjects.Remove(go);
            CheckGameObjectTag(go).RemoveTags(tags);
        }

        public static string[] GetGameObjectTags(GameObject go)
        {
            return s_TagTable.Where(kv => kv.Value.gameObjects.Contains(go))
                .Select(kv => kv.Key)
                .ToArray();
        }

        public static string[] GetAllTags() => s_TagTable.Keys.ToArray();
        public static GameObject GetGameObject(string tag) => pattern.With(tag).GameObject();
        public static GameObject[] GetGameObjects(string tag) => pattern.With(tag).GameObjects();

        public static IEnumerable<string> GameObjectTags(GameObject go)
        {
            return s_TagTable.Where(kv => kv.Value.gameObjects.Contains(go)).Select(kv => kv.Key);
        }

        public static IEnumerable<string> AllTags() => s_TagTable.Keys.AsEnumerable();

#region TagPattern
        private class TagPatternImpl : TagPattern
        {
            private HashSet<GameObject> m_List;
            private Mode m_Mode = Mode.And;

            private HashSet<GameObject> AllGameObject()
            {
                var e = new HashSet<GameObject>(Object.FindObjectsOfType<GameObject>()
                    .Where(go => go.scene.isLoaded));
                return s_SearchFrom == null ? e : e.And(s_SearchFrom);
            }

            private HashSet<GameObject> Empty() => new HashSet<GameObject>();
            public override GameObject GameObject() => GameObjects().FirstOrDefault();

            public override GameObject[] GameObjects()
            {
                var list = m_List == null ? Empty() : m_List;
                return list.ToArray();
            }

            public override int Count() => m_List.Count;

            public override TagPattern And()
            {
                m_Mode = Mode.And;
                return this;
            }

            public override TagPattern Or()
            {
                m_Mode = Mode.Or;
                return this;
            }

            public override TagPattern Exclude()
            {
                m_Mode = Mode.Exclude;
                return this;
            }

            public override TagPattern And(TagPattern pattern) => Combine(pattern, Mode.And);
            public override TagPattern Or(TagPattern pattern) => Combine(pattern, Mode.Or);

            public override TagPattern Exclude(TagPattern pattern) =>
                Combine(pattern, Mode.Exclude);

            public override TagPattern Combine(TagPattern pattern) => Combine(pattern, m_Mode);

            private TagPattern Combine(TagPattern pattern, Mode mode)
            {
                var pat = pattern as TagPatternImpl;
                return Combine(pat.m_List, mode);
            }

            private TagPattern Combine(HashSet<GameObject> list) => Combine(list, m_Mode);

            private TagPattern Combine(HashSet<GameObject> list, Mode mode)
            {
                list = list == null ? Empty() : list;

                switch (mode) {
                    case Mode.And:
                        m_List = m_List == null ? list : m_List.And(list);
                        break;
                    case Mode.Or:
                        m_List = m_List == null ? list : m_List.Or(list);
                        break;
                    case Mode.Exclude:
                        m_List = m_List == null ? AllGameObject().Exclude(list)
                            : m_List.Exclude(list);
                        break;
                }
                return this;
            }

            public override TagPattern All()
            {
                m_List = AllGameObject();
                return this;
            }

            public override TagPattern With(string tag) => Combine(WithInternal(tag));

            private HashSet<GameObject> WithInternal(string tag)
            {
                var e = string.IsNullOrEmpty(tag) || !s_TagTable.ContainsKey(tag) ? Empty()
                    : s_TagTable[tag].gameObjects;
                return s_SearchFrom == null ? e : e.And(s_SearchFrom);
            }

            public override TagPattern Both(params string[] tags) => Combine(BothInternal(tags));

            private HashSet<GameObject> BothInternal(IEnumerable<string> tags)
            {
                if (!tags.Any()) return Empty();
                foreach (var tag in tags)
                    if (!s_TagTable.ContainsKey(tag))
                        return Empty();
                var e = WithInternal(tags.First());
                foreach (var tag in tags.Skip(1))
                    e = e.And(s_TagTable[tag].gameObjects, s_SearchFrom);
                return e;
            }

            public override TagPattern Either(params string[] tags) =>
                Combine(EitherInternal(tags));

            private HashSet<GameObject> EitherInternal(IEnumerable<string> tags)
            {
                var list = new List<string>();
                foreach (var tag in tags)
                    if (s_TagTable.ContainsKey(tag))
                        list.Add(tag);
                if (list.Count == 0) return Empty();
                var e = WithInternal(list.First());
                foreach (var tag in list.Skip(1))
                    e = e.Or(s_TagTable[tag].gameObjects, s_SearchFrom);
                return e;
            }

            private enum Mode { And, Or, Exclude }
        }
#endregion

#region HashSet Operation
        private static HashSet<T> And<T>(this HashSet<T> a, HashSet<T> b)
        {
            var less = a.Count < b.Count ? a : b;
            var more = a.Count >= b.Count ? a : b;
            var result = new HashSet<T>();
            foreach (var item in less)
                if (more.Contains(item))
                    result.Add(item);
            return result;
        }

        private static HashSet<T> Or<T>(this HashSet<T> a, HashSet<T> b)
        {
            var less = a.Count < b.Count ? a : b;
            var more = a.Count >= b.Count ? a : b;
            var result = new HashSet<T>(more);
            foreach (var item in less) result.Add(item);
            return result;
        }

        private static HashSet<T> Exclude<T>(this HashSet<T> a, HashSet<T> b)
        {
            var result = new HashSet<T>(a);
            foreach (var item in b) result.Remove(item);
            return result;
        }

        private static HashSet<T> And<T>(this HashSet<T> a, IEnumerable<T> b)
        {
            var result = new HashSet<T>();
            foreach (var item in b)
                if (a.Contains(item))
                    result.Add(item);
            return result;
        }

        private static HashSet<T> And<T>(this HashSet<T> a, HashSet<T> b, IEnumerable<T> c)
        {
            if (c == null) return a.And(b);
            var result = new HashSet<T>();
            foreach (var item in c)
                if (a.Contains(item) && b.Contains(item))
                    result.Add(item);
            return result;
        }

        private static HashSet<T> Or<T>(this HashSet<T> a, HashSet<T> b, IEnumerable<T> c)
        {
            if (c == null) return a.Or(b);
            var result = new HashSet<T>(a);
            foreach (var item in c)
                if (b.Contains(item))
                    result.Add(item);
            return result;
        }
#endregion

#region Helpers
          public static T Find<T>(params object[] tags) where T : Component {
            return Find<T>(new GameObject[] { }, tags);
        }

        public static GameObject Find(params object[] tags) {
            return Find<GameObject>(new GameObject[] { }, tags);
        }

        public static T Find<T>(this GameObject[] parent, params object[] tags) where T : class {
            return Find(typeof(T), parent, tags) as T;
        }

        public static Object Find(Type type, GameObject[] parent, params object[] tags) {
            var ret = FindAll(type, parent, tags);
            if (typeof(Component).IsAssignableFrom(type)) {
                var r = ret.FirstOrDefault(t => (t != null ? t.GetComponent(type) : null) != null)?.GetComponent(type);
                return r == null ? null : r;
            }
            else {
                var r = ret.FirstOrDefault(t => t != null);
                return r == null ? null : r;
            }
        }

        public static List<GameObject> FindAny(params string[] tags) {
            return FindAny(typeof(GameObject), null, tags.Cast<object>().ToArray());
        }

        public static bool isLogFound => PlayerPrefs.GetInt("TagSystem.isLogFound", 0) == 1;

        public static List<GameObject> FindAny(Type type, GameObject[] parent, params object[] tags) {
            //InitScenes();
            var list = tags.Select(t => t is Enum e ? e.FullName() : $"{t}").ToArray();

            //Debug.Log(list.JoinStr());
            var ret = list.SelectMany(s => newQuery.Parent(parent).tags(s).withTypes(type).result).Distinct();
            if (isLogFound) {
                var msg = $"[find] {type.FullName} tags: {string.Join(", ", list)} Num: {ret.Count()}";
                Debug.Log(ret.Any() ? msg.ToGreen() : msg.ToRed());
            }

            if (typeof(Component).IsAssignableFrom(type))
                return ret.Where(t => t != null && t.GetComponent(type) != null).ToList();

            return ret.Where(t => t != null).ToList();
        }

        public static TagQuery newQuery => new TagQuery();


        public static IEnumerable<GameObject> FindAll(Type type, GameObject[] parent, params object[] tags) {
            //InitScenes();
            var list = tags.Select(t => t is Enum e ? e.FullName() : $"{t}").ToArray();
            var ret = newQuery.Parent(parent).tags(list).withTypes(type).result;
            if (isLogFound) {
                var msg = $"[find] {type.FullName} tags: {string.Join(", ", list)} Num: {ret.Count}";
                Debug.Log(ret.Count > 0 ? msg.ToGreen() : msg.ToRed());
            }

            if (typeof(Component).IsAssignableFrom(type))
                return ret.Where(t => t != null && t.GetComponent(type) != null);
            else
                return ret.Where(t => t != null);
        }

        public static T Find<T>(this Component parent, params object[] tags) where T : Component {
            return Find<T>(new[] { parent?.gameObject }, tags);
        }

        public static T Find<T>(this GameObject parent, params object[] tags) where T : Component {
            return Find<T>(new[] { parent }, tags);
        }

        public static IEnumerable<GameObject> Query(Transform[] parent = null,
            params (string[] tag, Type[] type)[] aQuery) {
            //if (!Application.isPlaying) return new List<GameObject>();
            var result = new List<IEnumerable<GameObject>>();
            IEnumerable<GameObject> ret = null;
            aQuery.ForEach((q, i) => {
                if (ret == null || ret.Any()) {
                    ret = q.tag.SelectMany(t => GetGameObjects(t).Where(go =>
                        go != null && q.tag.All(nt => GetGameObjects(nt).Contains(go))
                        && (i == 0 || result[i - 1].Any(p => go.GetParents().Contains(p))) && (q.type == null
                            || !q.type.Any() || q.type.All(type => go.GetComponent(type) != null))));
                    result.Add(ret);
                }
            });
            return ret?.Where(t => parent == null || parent.All(p => p?.gameObject == null) || parent
                .Where(p => p?.gameObject != null)
                .Any(p => t.transform.GetComponentsInParent<Transform>(true).Contains(p))) ?? new List<GameObject>();
        }

//        public static IEnumerable<Node> QueryNodes(Graph[] parent = null, params (string[] tag, Type[] type)[] query)
//        {
//            //if (!Application.isPlaying) return new List<GameObject>();
//            var result = new List<IEnumerable<Node>>();
//            IEnumerable<Node> ret = null;
//            query.ForEach((q, i) => {
//                if (ret == null || ret.Any()) {
//                    ret = q.tag.SelectMany(t => GetNodes(t).Where(go =>
//                        go != null && q.tag.All(nt => GetNodes(nt).Contains(go)) &&
//                        (i == 0 || result[i - 1].Any(p => go.GetType() == p.GetType())) && (q.type == null ||
//                            !q.type.Any() || q.type.All(type => go.GetType() == type))));
//                    result.Add(ret);
//                }
//            });
//            return ret?.Where(t => parent == null || parent.All(p => p == null) || parent
//                .Where(p => p != null).Any(p => p.allNodes.Contains(t))) ?? new List<Node>();
//        }

//        public static Node[] GetNodes(string tag) => pattern.With(tag._TagKey()).Nodes();
//        public static IEnumerable<string> NodeTags(this Node node)
//        {
//            return s_TagTable.Where(kv => kv.Value.nodes.Contains(node)).Select(kv => kv.Key);
//        }
        public static void SetText(this Tags aTagProxy, object value, int max = -1) {
            var go = aTagProxy.gameObject;
            var has = go.GetComponentInChildren<TMP_Text>()?.Of(t => t.text = $"{value}") != null;
            has = go.GetComponentInChildren<Text>()?.Of(t => t.text = $"{value}") != null || has;
            has = go.GetComponentInChildren<Slider>()?.Of(t => t.value = Convert.ToInt32(value)) != null || has;
            has = go.GetComponentInChildren<RadialSlider>()?.Of(t =>
                    t.GetComponent<Image>().fillAmount =
                        max != -1 ? Convert.ToSingle(Convert.ToInt32(value) / max) : Convert.ToSingle(value)) != null
                || has;
            if (has && isDisplayDebug) Debug.Log($"{go.name} = {value}", go);
        }

        public static bool isDisplayDebug { get; set; } = true;

#endregion
    }
}
