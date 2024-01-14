using System.Net.NetworkInformation;
using System.Net.Sockets;
using Sirenix.OdinInspector;
using SqlCipher4Unity3D;
using StackExchange.Redis;
using UnityEngine;

namespace App
{
    public class RedisData : DataModel<RedisData>
    {
        private IDatabase m_Database;
        public IDatabase data => m_Database ??= redis?.GetDatabase();
        private ConnectionMultiplexer m_Redis;
        public string host = "192.168.1.65";
        public string password = "admin";
        public enum AddressType { IPv4, IPv6 }
        public string testKey = "test:redis";
        public string testValue = "123";
        public RedisKey someKey;

        public static string GetIP(AddressType type = AddressType.IPv4)
        {
            //Return null if ADDRESSFAM is Ipv6 but Os does not support it
            if (type == AddressType.IPv6 && !Socket.OSSupportsIPv6) {
                return null;
            }
            string output = "";

            foreach (NetworkInterface item in NetworkInterface.GetAllNetworkInterfaces()) {
#if UNITY_EDITOR_WIN || UNITY_STANDALONE_WIN
            NetworkInterfaceType _type1 = NetworkInterfaceType.Wireless80211;
            NetworkInterfaceType _type2 = NetworkInterfaceType.Ethernet;

            if ((item.NetworkInterfaceType == _type1 || item.NetworkInterfaceType == _type2) && item.OperationalStatus == OperationalStatus.Up)
#endif
                {
                    foreach (UnicastIPAddressInformation ip in item.GetIPProperties().UnicastAddresses) {
                        //IPv4
                        if (type == AddressType.IPv4) {
                            if (ip.Address.AddressFamily == AddressFamily.InterNetwork) {
                                output = ip.Address.ToString();
                            }
                        }

                        //IPv6
                        else if (type == AddressType.IPv6) {
                            if (ip.Address.AddressFamily == AddressFamily.InterNetworkV6) {
                                output = ip.Address.ToString();
                            }
                        }
                    }
                }
            }
            return output;
        }

        public ConnectionMultiplexer redis {
            get {
                // if (isQuitting) return m_Redis;
                return m_Redis ??= ConnectionMultiplexer.Connect($"{self.host},password={self.password}");
            }
        }

        private void OnEnable()
        {
            //Test();
        }

        private void OnDestroy()
        {
            m_Redis?.Close();
            m_Redis?.Dispose();
            m_Redis = null;
        }

        public void Test()
        {
            // 设置Key和对应的String值
            data.StringSet(testKey, testValue);

            // 删除Key和对应的值
            data.KeyDelete(testKey);

            // 生成随机Key
            someKey = data.KeyRandom();
            data.StringSet(testKey, testValue);
            data.StringGet(testKey); // 将输出123
            data.StringIncrement(testKey);
            Debug.Log($"redis {testKey} => " + data.StringGet(testKey));
            // 将输出124
            redis.GetSubscriber().Subscribe("js", (channel, message) => {
                Debug.Log((string)message);
            });
        }

        [Button]
        public void ResetIP()
        {
            host = GetIP(AddressType.IPv4);
        }
    }
}
