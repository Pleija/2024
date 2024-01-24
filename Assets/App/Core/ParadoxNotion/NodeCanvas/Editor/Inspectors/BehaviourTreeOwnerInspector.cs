#if UNITY_EDITOR

#region
using NodeCanvas.BehaviourTrees;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
#endregion

namespace NodeCanvas.Editor
{
    [CustomEditor(typeof(BehaviourTreeOwner))]
    public class BehaviourTreeOwnerInspector : GraphOwnerInspector
    {
        private BehaviourTreeOwner owner => target as BehaviourTreeOwner;

        protected override void OnPreExtraGraphOptions()
        {
            EditorUtils.Separator();
            owner.repeat = EditorGUILayout.Toggle("Repeat", owner.repeat);

            if (owner.repeat) {
                GUI.color = Color.white.WithAlpha(owner.updateInterval > 0 ? 1 : 0.5f);
                owner.updateInterval = EditorGUILayout.FloatField(
                    "Update Interval", owner.updateInterval);
                GUI.color = Color.white;
            }
        }
    }
}

#endif
