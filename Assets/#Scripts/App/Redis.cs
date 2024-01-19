using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using Models;
using Sirenix.OdinInspector;
using Sirenix.Utilities;
using SqlCipher4Unity3D;
using UniRx;
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
            if (!Application.isPlaying || (!Application.isEditor && !Debug.isDebugBuild)) return;
            RedisData.self.Test(message => {
                Debug.Log("restart app");
                Loading.Restart();
            });
            RedisData.self.Redis(t => t.GetSubscriber().Subscribe("update", (channel, data) => {
                Debug.Log($"redis update: {data}");
                var type = ModelBase.Defaults.Keys.FirstOrDefault(x => x.FullName == data.ToString());
                if (type == null) return;
                Debug.Log($"found: {data}");
                ModelBase.Defaults[type].SetupFromRedis();
            }));
        }
    }
}
