using System;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using UnityEditor;
using UnityEngine;

public static partial class Core
{
    public static string GetLocalIPv4() {
        return Dns.GetHostEntry(Dns.GetHostName()).AddressList
            .LastOrDefault(f => f.AddressFamily == AddressFamily.InterNetwork)?.ToString();
    }

    //获取本机ip地址
    public static string GetIP() {
        var adapters = NetworkInterface.GetAllNetworkInterfaces();
        foreach (var adater in adapters)
            if (adater.Supports(NetworkInterfaceComponent.IPv4)) {
                var UniCast = adater.GetIPProperties().UnicastAddresses;
                if (UniCast.Count > 0)
                    foreach (var uni in UniCast)
                        if (uni.Address.AddressFamily == AddressFamily.InterNetwork)

                            //Debug.Log(uni.Address.ToString());
                            return uni.Address.ToString();
            }

        return null;
    }

    public static long GetNetworkTimestamp() {
        return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - 1638000000000L;
    }

    //
    //     public static TA RandomEnumValue<TA>() where TA : Enum
    //     {
    //         var v = Enum.GetValues(typeof(TA));
    //
    //         return (TA)v.GetValue(Random.Range(0, v.Length));
    //     }
    //
    //     public static string NewGuid() => Guid.NewGuid().ToString("N");
    //
    //     public static List<Component> FindObjectsOfTypeAll(Type type)
    //     {
    //         return SceneManager.GetActiveScene()
    //             .GetRootGameObjects()
    //             .SelectMany(g => g.GetComponentsInChildren(type, true))
    //             .ToList();
    //     }
    //
    //     public static T FindInRoot<T>() where T : Component => FindInRoot(typeof(T)) as T;
    //
    //     public static Component FindInRoot(Type type)
    //     {
    //         return SceneManager.GetActiveScene()
    //             .GetRootGameObjects()
    //             .Select(t => t.GetComponent(type))
    //             .FirstOrDefault(t => t != null);
    //     }
    //
    //     public static List<T> FindObjectsOfTypeAll<T>()
    //     {
    //         return SceneManager.GetActiveScene()
    //             .GetRootGameObjects()
    //             .SelectMany(g => g.GetComponentsInChildren<T>(true))
    //             .ToList();
    //     }
    //
    //     public static Component FindObjectOfTypeAll(Type type)
    //     {
    //         if (!SceneManager.GetActiveScene().isLoaded) {
    //             return null;
    //         }
    //
    //         return SceneManager.GetActiveScene()
    //             .GetRootGameObjects()
    //             .SelectMany(g => g.GetComponentsInChildren(type, true))
    //             .FirstOrDefault();
    //
    //         //.ToList();
    //     }
    //
    //     public static T FindObjectOfTypeAll<T>()
    //     {
    //         return SceneManager.GetActiveScene()
    //             .GetRootGameObjects()
    //             .SelectMany(g => g.GetComponentsInChildren<T>(true))
    //             .FirstOrDefault();
    //
    //         //.ToList();
    //     }
    //
    public static void Quit() {
        // save any game data here
#if UNITY_EDITOR
        if (Application.isEditor) {
            // Application.Quit() does not work in the editor so
            // UnityEditor.EditorApplication.isPlaying need to be set to false to end the game
            EditorApplication.isPlaying = false;
            return;
        }

#endif
        Application.Quit();
    }
}