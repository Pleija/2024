
using Common;
using Sirenix.OdinInspector;
using UnityEngine;

namespace App
{
    [ExecuteAlways]
    public class Redis : Singleton<Redis>
    {
        [Button]
        public void Start()
        {
           if(Application.isEditor || Debug.isDebugBuild) RedisData.self.Test();
        }
    }
}
