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
       
    }
}
