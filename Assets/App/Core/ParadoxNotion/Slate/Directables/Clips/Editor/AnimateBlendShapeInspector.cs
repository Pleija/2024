#if UNITY_EDITOR

#region
using System.Linq;
using Slate.ActionClips;
using UnityEditor;
using UnityEngine;
#endregion

namespace Slate
{
    [CustomEditor(typeof(AnimateBlendShape))]
    public class AnimateBlendShapeInspector : ActionClipInspector<AnimateBlendShape>
    {
        public override void OnInspectorGUI()
        {
            ShowCommonInspector();
            GUI.enabled = action.root.currentTime <= 0;

            if (action.actor == null) {
                action.skinName = EditorGUILayout.TextField("Skin", action.skinName);
                action.shapeName = EditorGUILayout.TextField("Shape", action.shapeName);
                return;
            }
            var skins = action.actor.GetComponentsInChildren<SkinnedMeshRenderer>()
                    .Where(s => s.sharedMesh.blendShapeCount > 0)
                    .ToList();

            if (skins == null || skins.Count == 0) {
                EditorGUILayout.HelpBox(
                    "There are no Skinned Mesh Renderers with blend shapes within the actor's GameObject hierarchy.",
                    MessageType.Warning);
                return;
            }
            action.skinName = EditorTools.Popup(
                "Skin", action.skinName, skins.Select(s => s.name).ToList());

            if (action.skinName != string.Empty) {
                var skin = skins.ToList().Find(s => s.name == action.skinName);
                if (skin != null)
                    action.shapeName = EditorTools.Popup("Shape", action.shapeName,
                        skin.GetBlendShapeNames().ToList());
            }
            ShowAnimatableParameters();
        }
    }
}

#endif
