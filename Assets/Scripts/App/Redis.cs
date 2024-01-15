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

            if (Application.isEditor || Debug.isDebugBuild) {
                RedisData.self.Test(() => {
                    if (Application.isPlaying) {
                        Loading.Restart();
                        //OnUpdate.Invoke();
                    }
                });
            }
            else {
                Debug.Log("redis is disabled in production");
            }
        }
    }
}
