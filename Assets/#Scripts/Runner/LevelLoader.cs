using UnityEngine;

namespace Runner
{
    public class LevelLoader : MonoBehaviour
    {
        public void LoadLevel(string name)
        {
            Res.LoadScene(name);
            //SceneManager.LoadScene(name);
        }
    }
}
