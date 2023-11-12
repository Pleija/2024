using UnityEngine;

namespace Runner.UI
{
    public class MainMenu : MonoBehaviour
    {
        public void LoadScene(string name)
        {
            SceneLoader.LoadScene(name);
            //SceneManager.LoadScene(name);
        }
    }
}
