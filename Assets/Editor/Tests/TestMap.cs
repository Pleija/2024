using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using App;
using Models;
using UnityEditor;
using UnityEngine;

namespace Tests
{
    public class TestMap
    {
        static IEnumerable<string> ChunksUpto(string str, int maxChunkSize) {
            for (int i = 0; i < str.Length; i += maxChunkSize) 
                yield return str.Substring(i, Math.Min(maxChunkSize, str.Length-i));
        }

        [MenuItem("Debug/Test Redis")]
        static void TestRedis()
        {
            RedisData.self.Redis(t => t.GetSubscriber().Publish("js","test"));
        }

        [MenuItem("Debug/Map")]
        static void Map()
        {
            var mapstr = AssetDatabase.LoadAssetAtPath<TextAsset>("Assets/Res/maps/data/03.txt").text;
            mapstr = Encoding.ASCII.GetString(Convert.FromBase64String(mapstr));
            var newStr = ChunksUpto(mapstr, 28).ToArray();
            Debug.Log($"count: {newStr.Count()}, last: {newStr.Last().Length}");

            var list = new List<string>();
            for(int i = 0; i < newStr.Length; i++) {
                list.Add($"{i}: {newStr[i]}");
            }
            Debug.Log(string.Join("\n",list));
        }
    }
}
