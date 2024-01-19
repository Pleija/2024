using UnityEngine;

namespace Runner.UI
{
    public class MainMenu : MonoBehaviour
    {
        public void LoadScene(string name)
        {
            Res.LoadScene(name);
            //SceneManager.LoadScene(name);
        }
    }
}
