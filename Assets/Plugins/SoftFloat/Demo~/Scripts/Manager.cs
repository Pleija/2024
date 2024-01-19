using UnityEngine;

namespace PhysicDemo.Example
{
    public class Manager : MonoBehaviour
    {
        public Material defaultMaterial;
        public int seed;

        private static Manager _instance;
        public static Manager Instance => _instance;
        // {
        //     get
        //     {
        //         if (_instance == null)
        //         {
        //             _instance = FindObjectOfType<Manager>();
        //         }
        //
        //         return _instance;
        //     }
        // }

        public static MaterialPropertyBlock materialPropertyBlock;

        private void Awake()
        {
            _instance = this;
            materialPropertyBlock = new MaterialPropertyBlock();
        }

        private void OnDestroy()
        {
            _instance = null;
        }
    }
}
