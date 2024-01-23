using System;
using System.Collections.Generic;
using System.Linq;
using Models;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;

public class ObjectIds : View<ObjectIds>
{
    [Serializable]
    public class Item
    {
        public GameObject gameObject;
        public string name;
        public bool active;
        public string parent;
        public Vector3 position;
        public Vector3 scale;
        public Quaternion rotation;
        public string root;
        public RectTransformData rectTransformData;
        public string guid = Guid.NewGuid().ToString();
        public List<Component> components = new List<Component>();
    }

    [Serializable]
    public class RectTransformData
    {
        public Vector3 LocalPosition;
        public Vector2 AnchoredPosition;
        public Vector2 SizeDelta;
        public Vector2 AnchorMin;
        public Vector2 AnchorMax;
        public Vector2 Pivot;
        public Vector3 Scale;
        public Quaternion Rotation;

        public void PullFromTransform(RectTransform transform)
        {
            LocalPosition = transform.localPosition;
            AnchorMin = transform.anchorMin;
            AnchorMax = transform.anchorMax;
            Pivot = transform.pivot;
            AnchoredPosition = transform.anchoredPosition;
            SizeDelta = transform.sizeDelta;
            Rotation = transform.localRotation;
            Scale = transform.localScale;
        }

        public void PushToTransform(RectTransform transform)
        {
            transform.localPosition = LocalPosition;
            transform.anchorMin = AnchorMin;
            transform.anchorMax = AnchorMax;
            transform.pivot = Pivot;
            transform.anchoredPosition = AnchoredPosition;
            transform.sizeDelta = SizeDelta;
            transform.localRotation = Rotation;
            transform.localScale = Scale;
        }
    }

    public List<Item> items;
    public List<GameObject> all;

    public void Save()
    {
        all = gameObject.scene.GetRootGameObjects()
            .SelectMany(x => x.GetComponentsInChildren<Transform>(true)).Distinct()
            .Select(x => x.gameObject).ToList();
        items = all.Select(x => new Item() { gameObject = x }).ToList();
        Redis.Database.KeyDelete($"SceneData:{gameObject.scene.name}");
        items.ForEach(Press);
        Redis.Database.StringSet($"SceneData:{gameObject.scene.name}:this",
            JsonUtility.ToJson(this));
        Debug.Log($"Setup Ids: {items.Count}");
    }

    public void Press(Item data)
    {
        data.name = data.gameObject.name;
        data.components = data.gameObject.GetComponents<Component>().ToList();
        data.root = items.First(x => data.gameObject.transform.root.gameObject).guid;
        data.active = data.gameObject.activeSelf;
        data.position = data.gameObject.transform.localPosition;
        data.scale = data.gameObject.transform.localScale;
        data.rotation = data.gameObject.transform.localRotation;
        data.parent = data.gameObject.transform.parent != null ? items.First(x => x.gameObject).guid
            : null;

        if (data.gameObject.TryGetComponent(typeof(RectTransform), out var rect)) {
            data.rectTransformData = new RectTransformData();
            data.rectTransformData.PullFromTransform(rect as RectTransform);
        }
        Redis.Database.HashSet($"SceneData:{gameObject.scene.name}", data.guid,
            JsonUtility.ToJson(data));
    }
}
