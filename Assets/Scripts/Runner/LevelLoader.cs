using UnityEngine;

namespace Runner
{
    public class LevelLoader : MonoBehaviour
    {
        public void LoadLevel(string name)
        {
            SceneLoader.LoadScene(name);
            //SceneManager.LoadScene(name);
        }
    }
}
