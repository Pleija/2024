using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

//This script is not actually used in the game,
//but it's left in the project as a very simple example of loading and instantiating a Prefab from Addressables
namespace Royale
{
    public class AAUsageExample : MonoBehaviour
    {
        public AssetReferenceGameObject refObject;

        private void Start()
        {
            //Request loading
            refObject.LoadAssetAsync().Completed += OnPrefabLoaded;
        }

        private void OnPrefabLoaded(AsyncOperationHandle<GameObject> asyncOp)
        {
            Debug.Log(asyncOp.Result.name + " loaded.");

            //Instantiate the newly loaded AA on the world's origin
            Instantiate<GameObject>(asyncOp.Result, Vector3.zero, Quaternion.identity, null);
        }
    }
}