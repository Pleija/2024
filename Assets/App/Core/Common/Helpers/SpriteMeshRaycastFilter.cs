//using System.Collections.Generic;
//using UnityEngine;
//using UnityEngine.UI;
//
//// Restrict raycasting to a sprite mesh shape
//// Could use Image.alphaHitTestMinimumThreshold to mask but that requires read/write images which can't be packed
//[RequireComponent(typeof(Image))]
//public class SpriteMeshRaycastFilter : MonoBehaviour, ICanvasRaycastFilter {
//
//    private RectTransform rectTransform;
//    private Image image;
//    
//    private class CachedSpriteMesh {
//        public readonly ushort[] Triangles;
//        public readonly Vector2[] Positions;
//
//        public CachedSpriteMesh(ushort[] tris, Vector2[] posns) {
//            Triangles = tris;
//            Positions = posns;
//        }
//    }
//    // instance ID -> cached tris/positions since we can only get copies
//    private static Dictionary<int, CachedSpriteMesh> cachedSpriteMeshes;
//    private CachedSpriteMesh spriteMesh;
//
//
//    private void GetReferences() {
//        if (rectTransform == null)
//            rectTransform = GetComponent<RectTransform>();
//        if (image == null)
//            image = GetComponent<Image>();
//        if (cachedSpriteMeshes == null)
//            cachedSpriteMeshes = new Dictionary<int, CachedSpriteMesh>();
//    }
//
//    private CachedSpriteMesh GetSpriteMesh() {
//        if (spriteMesh == null) {
//            // This is not threadsafe, obvs - OK to use in Unity thread though
//            var sprite = image.sprite;
//            int id = image.sprite.GetInstanceID();
//            if (!cachedSpriteMeshes.TryGetValue(id, out spriteMesh)) {
//                spriteMesh = new CachedSpriteMesh(sprite.triangles, sprite.vertices);
//                cachedSpriteMeshes.Add(id, spriteMesh);
//            }
//        }
//
//        return spriteMesh;
//    }
//
//    public bool IsRaycastLocationValid(Vector2 screenPoint, Camera eventCamera) {
//        GetReferences();
//
//        if (!RectTransformUtility.ScreenPointToLocalPointInRectangle(
//            rectTransform, screenPoint, eventCamera, out var local))
//            return false;
//
//        Vector2 uiSz = image.GetPixelAdjustedRect().size;
//        Vector2 spriteSz = image.sprite.rect.size;
//        Vector2 sz = uiSz;
//        if (image.preserveAspect) {
//            float spriteAspect = spriteSz.x / spriteSz.y;
//            float uiAspect = uiSz.x / uiSz.y;
//            if (uiAspect > spriteAspect) {
//                // UI is wider, width is limited
//                sz.x = sz.y * spriteAspect;
//            } else {
//                // UI is taller, height is limited
//                sz.y = sz.x / spriteAspect;
//            }
//        }
//
//        // Adjust the local pos into normalised space
//        local /= sz;
//        // Adjust via pivot so that position is relative to centre
//        local += rectTransform.pivot - new Vector2(0.5f, 0.5f);
//
//        var sm = GetSpriteMesh();
//
//        // Debug
//        // for (int i = 0; i < sm.Triangles.Length; i += 3) {
//        //     Debug.DrawLine(sm.Positions[sm.Triangles[i]], sm.Positions[sm.Triangles[i+1]]);
//        //     Debug.DrawLine(sm.Positions[sm.Triangles[i+1]], sm.Positions[sm.Triangles[i+2]]);
//        //     Debug.DrawLine(sm.Positions[sm.Triangles[i+2]], sm.Positions[sm.Triangles[i+0]]);
//        // }
//        // Vector2 xoffset = new Vector2(0.1f, 0);
//        // Vector2 yoffset = new Vector2(0, 0.1f);
//        // Debug.DrawLine(local - xoffset, local + xoffset, Color.cyan);
//        // Debug.DrawLine(local - yoffset, local + yoffset, Color.cyan);
//
//        
//        for (int i = 0; i < sm.Triangles.Length; i += 3) {
//            if (local.PointInTriangle2D(
//                sm.Positions[sm.Triangles[i]],
//                sm.Positions[sm.Triangles[i + 1]],
//                sm.Positions[sm.Triangles[i + 2]])) {
//                return true;
//            }
//        }
//
//        return false;
//    }
//    
//    
//}
///*
//This is free and unencumbered software released into the public domain.
//
//Anyone is free to copy, modify, publish, use, compile, sell, or
//distribute this software, either in source code form or as a compiled
//binary, for any purpose, commercial or non-commercial, and by any
//means.
//
//In jurisdictions that recognize copyright laws, the author or authors
//of this software dedicate any and all copyright interest in the
//software to the public domain. We make this dedication for the benefit
//of the public at large and to the detriment of our heirs and
//successors. We intend this dedication to be an overt act of
//relinquishment in perpetuity of all present and future rights to this
//software under copyright law.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
//IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
//OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
//ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
//OTHER DEALINGS IN THE SOFTWARE.
//
//For more information, please refer to <http://unlicense.org/>
//*/


