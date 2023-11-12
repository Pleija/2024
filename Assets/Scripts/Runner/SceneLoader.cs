
using Common;

#if UNITY_EDITOR
using UnityEditor.SceneManagement;

#endif
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.SceneManagement;

namespace Runner
{
    public class SceneLoader : Singleton<SceneLoader>, IAutoCreate, IDontDestroyOnLoad
    {
        public static void LoadScene(string aName, LoadSceneMode mode = LoadSceneMode.Single)
        {
            //SceneManager.LoadScene(aName);
            if(Application.isEditor) {
#if UNITY_EDITOR
                var p1 = EditorSceneManager.LoadSceneAsyncInPlayMode($"Assets/Scenes/{aName}.unity",
                    new LoadSceneParameters() {
                        loadSceneMode = mode,
                    });
#endif
                return;
            }
            Addressables.LoadSceneAsync(aName, mode);
        }
    }
}
