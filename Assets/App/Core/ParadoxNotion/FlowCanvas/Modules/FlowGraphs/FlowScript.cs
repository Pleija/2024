#region
using ParadoxNotion.Design;
using UnityEditor;
using UnityEngine;
#endregion

namespace FlowCanvas
{
    ///<summary>FlowScripts are assigned or bound to FlowScriptControllers</summary>
    [CreateAssetMenu(menuName = "ParadoxNotion/FlowCanvas/FlowScript Asset")]
    public class FlowScript : FlowScriptBase
    {
        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        [MenuItem("Tools/ParadoxNotion/FlowCanvas/Create/FlowScript Asset", false, 1)]
        public static void CreateFlowScript()
        {
            var fs = EditorUtils.CreateAsset<FlowScript>();
            Selection.activeObject = fs;
        }

#endif
        ///----------------------------------------------------------------------------------------------
    }
}
