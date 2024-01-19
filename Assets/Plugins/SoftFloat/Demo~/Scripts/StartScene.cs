using UnityEngine;
using UnityEngine.SceneManagement;

namespace PhysicDemo.Example
{
    public class StartScene : MonoBehaviour
    {
        public void LoadStartScene()
        {
            SceneManager.LoadScene(1);
        }
    }
}
