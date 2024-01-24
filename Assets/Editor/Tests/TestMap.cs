#region
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Models;
using UnityEditor;
using UnityEngine;
#endregion

namespace Tests
{
    public class TestMap
    {
        private static IEnumerable<string> ChunksUpto(string str, int maxChunkSize)
        {
            for (var i = 0; i < str.Length; i += maxChunkSize)
                yield return str.Substring(i, Math.Min(maxChunkSize, str.Length - i));
        }

        [MenuItem("Tests/Test Redis")]
        private static void TestRedis()
        {
            Redis.Publish("js", "test");
        }

        [MenuItem("Tests/Map")]
        private static void Map()
        {
            var mapstr = AssetDatabase.LoadAssetAtPath<TextAsset>("Assets/Res/maps/data/03.txt")
                    .text;
            mapstr = Encoding.ASCII.GetString(Convert.FromBase64String(mapstr));
            var newStr = ChunksUpto(mapstr, 28).ToArray();
            Debug.Log($"count: {newStr.Count()}, last: {newStr.Last().Length}");
            var list = new List<string>();
            for (var i = 0; i < newStr.Length; i++) list.Add($"{i}: {newStr[i]}");
            Debug.Log(string.Join("\n", list));
        }
    }
}
