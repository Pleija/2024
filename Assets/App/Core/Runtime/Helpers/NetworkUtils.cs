using System.Net;
using UnityEditor;
using UnityEngine;

namespace Runtime.Helpers
{
    public class NetworkUtils
    {
        public static string GetHostName(string ipAddress) {
            var entry = Dns.GetHostEntry(ipAddress);
            return entry.HostName;
        }

        #if UNITY_EDITOR
        [MenuItem("Tests/domain to ip")]
        static void TestDNS() {
            Debug.Log(GetHostName("aerochess.com"));
        }
        #endif
    }
}
