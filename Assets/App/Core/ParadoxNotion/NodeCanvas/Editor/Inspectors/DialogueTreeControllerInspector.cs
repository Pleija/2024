#if UNITY_EDITOR

#region
using NodeCanvas.DialogueTrees;
using UnityEditor;
#endregion

namespace NodeCanvas.Editor
{
    [CustomEditor(typeof(DialogueTreeController))]
    public class DialogueTreeControllerInspector : GraphOwnerInspector
    {
        private DialogueTreeController controller => target as DialogueTreeController;

        protected override void OnPostExtraGraphOptions()
        {
            if (controller.graph != null)
                DialogueTreeInspector.ShowActorParameters((DialogueTree)controller.graph);
        }
    }
}

#endif
