#if UNITY_EDITOR

#region
using System.Linq;
using System.Reflection;
using Slate.ActionClips;
using UnityEditor;
using UnityEngine;
#endregion

namespace Slate
{
    [CustomEditor(typeof(SendMessage), true)]
    public class SendMessageInspector : ActionClipInspector<SendMessage>
    {
        public override void OnInspectorGUI()
        {
            base.OnInspectorGUI();

            if (GUILayout.Button("Select Method")) {
                var menu = new GenericMenu();
                var components = action.actor.GetComponents<Component>();

                foreach (var c in components) {
                    var methods = c.GetType()
                            .GetMethods(BindingFlags.Instance | BindingFlags.Public);

                    foreach (var m in methods) {
                        if (m.Name.StartsWith("get_") || m.Name.StartsWith("set_")) continue;
                        if (m.ReturnType != typeof(void)) continue;
                        var parameters = m.GetParameters();
                        var case1 = action.parameterType == null && parameters.Length == 0;
                        var case2 = action.parameterType != null
                                && parameters.Length == 1
                                && parameters.First().ParameterType == action.parameterType;

                        if (case1 || case2) {
                            var entry = string.Format("{0}/{1}", c.GetType().Name, m.Name);
                            menu.AddItem(new GUIContent(entry), false, () => {
                                action.message = string.Format("{0}.{1}", c.GetType().Name, m.Name);
                            });
                        }
                    }
                }
                menu.ShowAsContext();
            }
        }
    }
}

#endif
