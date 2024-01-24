#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEditor;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("✫ Utility"), Description("Plays a 'Beep' in editor only")]
    public class DebugBeep : ActionTask
    {
        protected override void OnExecute()
        {
#if UNITY_EDITOR
            EditorApplication.Beep();
#endif
            EndAction();
        }
    }
}
