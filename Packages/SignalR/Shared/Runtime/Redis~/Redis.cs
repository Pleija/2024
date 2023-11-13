// using System;
// using Sirenix.OdinInspector;
// using StackExchange.Redis;
// using UI;
// using UnityEngine;
//
// [Global]
// public class Redis : View<Redis>
// {
//     private static IDatabase m_Database;
//     public static IDatabase data => m_Database ??= redis?.GetDatabase();
//     private static ConnectionMultiplexer m_Redis;
//     public string host = "192.168.1.64";
//     public string password = "admin";
//
//     [Button]
//     void ResetIP()
//     {
//         host = Core.GetIP();
//     }
//
//     public static ConnectionMultiplexer redis {
//         get {
//             if(Core.isQuitting) return m_Redis;
// #if UNITY_EDITOR
//             self.host = Core.GetIP();
//             Debug.Log(self.host);
// #endif
//             return m_Redis ??=
//                 ConnectionMultiplexer.Connect($"{self.host},password={self.password}");
//         }
//     }
//
//     public string testKey = "test:redis";
//     public string testValue = "123";
//     public RedisKey someKey;
//
//     public override void Start()
//     {
//         base.Start();
//         // 以StackOverflow.Redis的开源项目为例
//         // 创建NoSQL数据库
//         //db = redis.GetDatabase();
//
//         // 设置Key和对应的String值
//         data.StringSet(testKey, testValue);
//
//         // 删除Key和对应的值
//         data.KeyDelete(testKey);
//
//         // 生成随机Key
//         someKey = data.KeyRandom();
//         data.StringSet(testKey, testValue);
//         data.StringGet(testKey); // 将输出123
//         data.StringIncrement(testKey);
//         Debug.Log($"redis {testKey} => " + data.StringGet(testKey));
//         ; // 将输出124
//     }
//
//     public override void OnDestroy()
//     {
//         m_Redis?.Close();
//         base.OnDestroy();
//     }
//
//     public override void Enter(AState from) { }
//     public override void Exit(AState to) { }
//     public override void Tick() { }
//     public override Enum GetName() => Item.Redis;
// }
