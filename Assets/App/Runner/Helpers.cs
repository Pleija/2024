#region
using UnityEngine;
#endregion

namespace Runner
{
    public class Helpers
    {
        // This sets the layer of all renderer children of a given gameobject (including itself)
        // Useful to make an object display only on a single camera (e.g. character on UI cam on loadout State)
        public static void SetRendererLayerRecursive(GameObject root, int layer)
        {
            var rends = root.GetComponentsInChildren<Renderer>(true);
            for (var i = 0; i < rends.Length; ++i) rends[i].gameObject.layer = layer;
        }
    }
}
