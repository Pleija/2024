using Models;
using Sirenix.OdinInspector;
using UnityEngine;
using UnityEngine.Events;

namespace App
{
    //[ExecuteAlways]
    public class Redis : Singleton<Redis>
    {
        public UnityEvent OnUpdate;

        [Button]
        public void Start()
        {
            if (Application.isPlaying && (Application.isEditor || Debug.isDebugBuild)) {
                RedisData.self.Test(message => {
                    Debug.Log("restart app");
                    Loading.Restart();
                });
            }
        }
    }
}
