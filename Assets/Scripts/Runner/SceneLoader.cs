#if UNITY_EDITOR
using UnityEditor.SceneManagement;
#endif
using System.Linq;
using System.Threading.Tasks;
using App;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.SceneManagement;

namespace Runner
{
    public class SceneLoader : Singleton<SceneLoader>, IAutoCreate, IDontDestroyOnLoad
    {
        public static async Task LoadScene(string aName, LoadSceneMode mode = LoadSceneMode.Single)
        {
            //SceneManager.LoadScene(aName);
            if (Application.isEditor) {
#if UNITY_EDITOR
                var p1 = EditorSceneManager.LoadSceneAsyncInPlayMode($"Assets/Scenes/{aName}.unity",
                    new LoadSceneParameters() {
                        loadSceneMode = mode,
                    });
#endif
                return;
            }

            if (Debug.isDebugBuild) {
                var handle = Addressables.CheckForCatalogUpdates(false);
                await handle.Task;

                if (handle.Status == AsyncOperationStatus.Succeeded && handle.Result.Any()) {
                    Debug.Log("Catalog updating");
                    await Addressables.UpdateCatalogs(handle.Result).Task;
                }
                if (handle.IsValid()) Addressables.Release(handle);
            }
            await Addressables.DownloadDependenciesAsync(aName).Task;
             JsMain.self.Reload(true);
            Addressables.LoadSceneAsync(aName, mode);
        }
    }
}
