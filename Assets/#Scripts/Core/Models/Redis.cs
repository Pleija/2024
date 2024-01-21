using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using Cysharp.Threading.Tasks;
using Sirenix.OdinInspector;
using SqlCipher4Unity3D;
using StackExchange.Redis;
using UnityEditor;
using UnityEngine;
using UnityEngine.Scripting;

namespace Models
{
    [Preserve]
    public class Redis
    {
        private static Redis m_Instance;
        public static Redis self => m_Instance ??= new Redis();
        private IDatabase m_Database;
        public static IDatabase Database => self.m_Database ??= Instance.GetDatabase();

        // public void Data(Action<IDatabase> fn)
        // {
        //     Redis(t => fn.Invoke(m_Database ??= t.GetDatabase()));
        //     //m_Database ??= redis?.GetDatabase();
        // }
        private ConnectionMultiplexer m_Redis;
        public string host = "192.168.1.65";
        public string password = "admin";
        public enum AddressType { IPv4, IPv6 }
        public string testKey = "test:redis";
        public string testValue = "123";
        private RedisKey someKey;

        public static string GetIP(AddressType type = AddressType.IPv4)
        {
            //Return null if ADDRESSFAM is Ipv6 but Os does not support it
            if (type == AddressType.IPv6 && !Socket.OSSupportsIPv6) return null;
            var output = "";

            foreach (var item in NetworkInterface.GetAllNetworkInterfaces()) {
#if UNITY_EDITOR_WIN || UNITY_STANDALONE_WIN
                NetworkInterfaceType _type1 = NetworkInterfaceType.Wireless80211;
                NetworkInterfaceType _type2 = NetworkInterfaceType.Ethernet;

                if ((item.NetworkInterfaceType == _type1 || item.NetworkInterfaceType == _type2) && item.OperationalStatus == OperationalStatus.Up)
#endif
                {
                    foreach (var ip in item.GetIPProperties().UnicastAddresses)
                        //IPv4
                        if (type == AddressType.IPv4) {
                            if (ip.Address.AddressFamily == AddressFamily.InterNetwork) output = ip.Address.ToString();
                        }
                        //IPv6
                        else if (type == AddressType.IPv6) {
                            if (ip.Address.AddressFamily == AddressFamily.InterNetworkV6)
                                output = ip.Address.ToString();
                        }
                }
            }
            return output;
        }

        public static ConnectionMultiplexer Instance {
            get {
                if (!(self.m_Redis is { IsConnected: true }))
                    self.m_Redis = ConnectionMultiplexer.Connect($"{self.host},password={self.password}");
                return self.m_Redis;
            }
        }

        public static void Sub(RedisChannel channel, Action<RedisChannel, RedisValue> handler,
            CommandFlags flags = CommandFlags.None)
        {
            Instance.GetSubscriber().Subscribe(channel, handler, flags);
        }

        public static void Sub(RedisChannel channel, CommandFlags flags = CommandFlags.None)
        {
            Instance.GetSubscriber().Subscribe(channel, flags);
        }

        public static void Publish(RedisChannel channel, RedisValue message, CommandFlags flags = CommandFlags.None)
        {
            Instance.GetSubscriber().Publish(channel, message, flags);
        }

        // public void Redis(Action<ConnectionMultiplexer> fn)
        // {
        //     fn.Invoke(Instance);
        //
        //     //if (m_Redis == null || !m_Redis.IsConnected) {
        //     //GetRedis(fn);
        //     //     return;
        //     // }
        //     // fn.Invoke(m_Redis);
        //
        //     // get {
        //     //     // if (isQuitting) return m_Redis;
        //     //     //ConnectionMultiplexer.ConnectAsync("")
        //     //     if (m_Redis == null) {
        //     //         GetRedis();
        //     //     }
        //     //     return m_Redis;
        //     //     //return m_Redis ??= ConnectionMultiplexer.Connect($"{self.host},password={self.password}");
        //     // }
        // }
        private Queue<Action<ConnectionMultiplexer>> m_Queue = new Queue<Action<ConnectionMultiplexer>>();

        private async UniTask GetRedis(Action<ConnectionMultiplexer> fn)
        {
            m_Queue.Enqueue(fn);
            if (m_Redis == null)
                m_Redis = await ConnectionMultiplexer.ConnectAsync($"{self.host},password={self.password}");
            else if (m_Redis.IsConnecting)
                return;
            else if (m_Redis.IsConnected)
                while (m_Queue.Any())
                    m_Queue.Dequeue()?.Invoke(m_Redis);

            // if (m_Redis.IsConnected) {
            //     fn.Invoke(m_Redis);
            // }
            // else {
            //     Debug.Log("Redis connect failed");
            // }
        }

        private void OnDestroy()
        {
            m_Redis?.Close();
            m_Redis?.Dispose();
            m_Redis = null;
        }

        public void Test(Action<string> fn = null)
        {
#if UNITY_EDITOR
            if (EditorApplication.isCompiling || EditorApplication.isUpdating) {
                Debug.Log("editor is busy");
                return;
            }
#endif
            // 设置Key和对应的String值
            Database.StringSet(testKey, testValue);

            // 删除Key和对应的值
            Database.KeyDelete(testKey);

            // 生成随机Key
            someKey = Database.KeyRandom();
            Database.StringSet(testKey, testValue);
            Database.StringGet(testKey); // 将输出123
            Database.StringIncrement(testKey);
            Debug.Log($"redis {testKey} => " + Database.StringGet(testKey));
            // 将输出124
            Sub("js", (channel, message) => {
                Debug.Log($"Redis Receive: {message} Invoked: {fn != null}");
                fn?.Invoke(message);
            });
        }

        [Button]
        public void ResetIP()
        {
            host = GetIP(AddressType.IPv4);
        }
    }
}
