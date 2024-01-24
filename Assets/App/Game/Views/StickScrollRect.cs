#region
using System;
using UnityEngine;
#endregion

namespace App
{
    [ExecuteInEditMode]
    public class StickScrollRect : View<StickScrollRect>
    {
        public float value = -1294f;
        private RectTransform rt;

        private void Update()
        {
            rt ??= GetComponent<RectTransform>();
            if (!Application.isPlaying && Math.Abs(rt.anchoredPosition.y - value) > float.Epsilon)
                rt.anchoredPosition = new Vector3(rt.anchoredPosition.x, value);
        }
    }
}
