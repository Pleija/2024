#region
using NodeCanvas.DialogueTrees;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Dialogue"),
     Description(
         "Starts the Dialogue Tree assigned on a Dialogue Tree Controller object with specified agent used for 'Instigator'."),
     Icon("Dialogue")]
    public class StartDialogueTree : ActionTask<IDialogueActor>
    {
        [RequiredField]
        public BBParameter<DialogueTreeController> dialogueTreeController;

        private DialogueTreeController instance;
        public bool isPrefab;
        public bool waitActionFinish = true;

        protected override string info =>
                string.Format("Start Dialogue {0}", dialogueTreeController);

        protected override void OnExecute()
        {
            instance = isPrefab ? Object.Instantiate(dialogueTreeController.value)
                    : dialogueTreeController.value;

            if (waitActionFinish) {
                instance.StartDialogue(agent, success => {
                    if (isPrefab) Object.Destroy(instance.gameObject);
                    EndAction(success);
                });
            }
            else {
                instance.StartDialogue(agent, success => {
                    if (isPrefab) Object.Destroy(instance.gameObject);
                });
                EndAction();
            }
        }
    }
}
