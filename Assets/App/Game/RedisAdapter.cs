#region
using System.Linq;
using Models;
using Sirenix.OdinInspector;
using SqlCipher4Unity3D;
using UnityEngine;
using UnityEngine.Events;
#endregion

namespace App
{
    //[ExecuteAlways]
    public class RedisAdapter : Singleton<RedisAdapter>
    {
        public UnityEvent OnUpdate;

        [Button]
        public void Start()
        {
            if (!Application.isPlaying || (!Application.isEditor && !Debug.isDebugBuild)) return;
            Redis.self.Test(message => {
                Debug.Log("restart app");
                Loading.Restart();
            });
            Redis.Sub("update", (channel, data) => {
                Debug.Log($"redis update: {data}");
                var type =
                        DbTable.Defaults.Keys.FirstOrDefault(x => x.FullName == data.ToString());
                if (type == null) return;
                Debug.Log($"found: {data}");
                DbTable.Defaults[type].SetupFromRedis();
            });
        }
    }
}
