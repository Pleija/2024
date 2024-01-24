#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine.SceneManagement;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Application")]
    public class LoadScene : ActionTask
    {
        public BBParameter<LoadSceneMode> mode;

        [RequiredField]
        public BBParameter<string> sceneName;

        protected override string info => string.Format("Load Scene {0}", sceneName);

        protected override void OnExecute()
        {
            SceneManager.LoadScene(sceneName.value, mode.value);
            EndAction();
        }
    }
}
