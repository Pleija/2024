using Sirenix.OdinInspector;
using SqlCipher4Unity3D;
using UnityEditor;
using UnityEngine;

namespace Game.GameData
{
    public class DataConfig : View<DataConfig>
    {
        public TestData test;

        [Button]
        public void OpenData()
        {
#if UNITY_EDITOR
            AssetDatabase.OpenAsset(test ? test : test = ScriptableObject.CreateInstance<TestData>());
#endif
        }
    }
}
