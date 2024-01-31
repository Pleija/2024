#region
using ParadoxNotion.Design;

#if UNITY_EDITOR
using UnityEditorInternal;

#endif
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [ExposeAsDefinition, ContextDefinedInputs(typeof(Wild), typeof(GameObject)),
     ContextDefinedOutputs(typeof(Wild)), Category("Flow Controllers/Selectors"),
     Description(
         "Select a Result value out of the input cases provided, based on a GameObject's Tag"),
     HasRefreshButton]
    public class SelectOnTag<T> : FlowControlNode
    {
        //serialized since tags are fetched in editor
        [SerializeField]
        private string[] _tagNames;

        protected override void RegisterPorts()
        {
#if UNITY_EDITOR
            _tagNames = InternalEditorUtility.tags;
#endif
            var selector = AddValueInput<GameObject>("Value");
            var cases = new ValueInput<T>[_tagNames.Length];
            for (var i = 0; i < cases.Length; i++)
                cases[i] = AddValueInput<T>("Is " + _tagNames[i], i.ToString());
            AddValueOutput("Result", "Value", () => {
                var tagValue = selector.value.tag;
                for (var i = 0; i < _tagNames.Length; i++)
                    if (_tagNames[i] == tagValue)
                        return cases[i].value;
                return default;
            });
        }
    }
}
