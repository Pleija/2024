using System;
using UnityEngine;
using UnityEngine.Serialization;

namespace Extensions
{
    [Serializable]
    public class RectTransformData
    {
        [FormerlySerializedAs("index")]
        public int Index;

        public string Name;
        public Vector3 LocalPosition;
        public Vector2 AnchoredPosition;
        public Vector2 SizeDelta;
        public Vector2 AnchorMin;
        public Vector2 AnchorMax;
        public Vector2 Pivot;
        public Vector3 Scale;
        public Quaternion Rotation;

        public RectTransformData() { }

        public RectTransformData(GameObject go) {
            PullFromTransform(go.GetComponent<RectTransform>() ?? go.transform);
        }

        public RectTransformData(Transform transform) {
            PullFromTransform(transform);
        }

        public RectTransformData(RectTransform transform) {
            PullFromTransform(transform);
        }

        public void PullFromTransform(Transform transform) {
            // var rect = transform.GetComponentInParent<Canvas>();
            // if ( rect != null) {
            //     PullFromTransform(transform.GetComponent<RectTransform>());
            // }
            // else {
            Index = transform.GetSiblingIndex();
            LocalPosition = transform.localPosition;
            Scale = transform.localScale;
            Rotation = transform.localRotation;
            Name = transform.name;

            //}
        }

        public void PushToTransform(GameObject go) {
            if (go.GetComponent<RectTransform>() is { } rectTransform)
                PushToTransform(rectTransform);
            else
                PushToTransform(go.transform);
        }

        public Transform PushToTransform(Transform transform) {
            // if (transform.TryGetComponent<RectTransform>(out var rectTransform) && rectTransform != null) {
            //     PushToTransform(rectTransform);
            // }
            // else {
            transform.SetSiblingIndex(Index);
            transform.localPosition = LocalPosition;
            transform.localScale = Scale;
            transform.localRotation = Rotation;
            transform.name = Name;

            //}
            return transform;
        }

        public Transform PullFromTransform(RectTransform transform) {
            Index = transform.GetSiblingIndex();
            LocalPosition = transform.localPosition;
            AnchorMin = transform.anchorMin;
            AnchorMax = transform.anchorMax;
            Pivot = transform.pivot;
            AnchoredPosition = transform.anchoredPosition;
            SizeDelta = transform.sizeDelta;
            Rotation = transform.localRotation;
            Scale = transform.localScale;
            return transform;
        }

        public RectTransform PushToTransform(RectTransform transform) {
            transform.SetSiblingIndex(Index);
            transform.localPosition = LocalPosition;
            transform.anchorMin = AnchorMin;
            transform.anchorMax = AnchorMax;
            transform.pivot = Pivot;
            transform.anchoredPosition = AnchoredPosition;
            transform.sizeDelta = SizeDelta;
            transform.localRotation = Rotation;
            transform.localScale = Scale;
            return transform;
        }
    }

    public static class RectTransforms
    {
        // places rect transform to have the same dimensions as 'other', even if they don't have same parent.
        // Relatively non-expensive.
        // NOTICE - also modifies scale of your rectTransf to match the scale of other
        public static void MatchOther(this RectTransform rt, RectTransform other) {
            var myPrevPivot = rt.pivot;
            myPrevPivot = other.pivot;
            rt.position = other.position;
            rt.localScale = other.localScale;
            rt.SetSizeWithCurrentAnchors(RectTransform.Axis.Horizontal, other.rect.width);
            rt.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, other.rect.height);

            //rectTransf.ForceUpdateRectTransforms(); - needed before we adjust pivot a second time?
            rt.pivot = myPrevPivot;
        }

        public static float Height(this RectTransform rt, float height = float.NaN) {
            if (!float.IsNaN(height)) rt.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, height);

            return rt.rect.height;
        }

        public static float Width(this RectTransform rt, float width = float.NaN) {
            if (!float.IsNaN(width)) rt.SetSizeWithCurrentAnchors(RectTransform.Axis.Horizontal, width);

            return rt.rect.width;
        }

        public static float Top(this RectTransform rt, float top = float.NaN) {
            if (!float.IsNaN(top)) rt.offsetMax = new Vector2(rt.offsetMax.x, top);

            return rt.offsetMax.y;
        }

        public static float Bottom(this RectTransform rt, float bottom = float.NaN) {
            if (!float.IsNaN(bottom)) rt.offsetMin = new Vector2(rt.offsetMin.x, bottom);

            return rt.offsetMin.y;
        }

        //public static Vector2 Pos(this RectTransform rt) => rt.anchoredPosition;

        public static Vector2 Pos(this RectTransform rt, Vector2 pos) {
            rt.anchoredPosition = pos;
            return rt.anchoredPosition;
        }

        public static Vector2 Pos(this RectTransform rt, float x = float.NaN, float y = float.NaN) {
            if (!float.IsNaN(x) || !float.IsNaN(y))
                rt.anchoredPosition = new Vector2(float.IsNaN(x) ? rt.anchoredPosition.x : x,
                    float.IsNaN(y) ? rt.anchoredPosition.y : y);

            return rt.anchoredPosition;
        }

        public static float PosX(this RectTransform rt, float x = float.NaN) {
            if (!float.IsNaN(x)) rt.anchoredPosition = new Vector2(x, rt.anchoredPosition.y);

            return rt.anchoredPosition.x;
        }

        public static float PosY(this RectTransform rt, float y = float.NaN) {
            if (!float.IsNaN(y)) rt.anchoredPosition = new Vector2(rt.anchoredPosition.x, y);

            return rt.anchoredPosition.y;
        }

        public static RectTransform SetLeft(this RectTransform rt, float left) {
            rt.offsetMin = new Vector2(left, rt.offsetMin.y);
            return rt;
        }

        public static RectTransform SetRight(this RectTransform rt, float right) {
            rt.offsetMax = new Vector2(-right, rt.offsetMax.y);
            return rt;
        }

        public static RectTransform SetTop(this RectTransform rt, float top) {
            //   rt.offsetMin = new Vector2(0, 0);
            rt.offsetMax = new Vector2(rt.offsetMax.x, -top);
            return rt;
        }

        public static RectTransform SetBottom(this RectTransform rt, float bottom) {
            rt.offsetMin = new Vector2(rt.offsetMin.x, bottom);
            return rt;
        }

        public static RectTransform SetRect(this RectTransform trs, float left, float top, float right, float bottom) {
            trs.offsetMin = new Vector2(left, bottom);
            trs.offsetMax = new Vector2(-right, -top);
            return trs;
        }
    }
}
