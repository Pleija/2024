using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using UnityEngine;
using UnityEngine.AddressableAssets;

namespace Maps
{
    public class Map : Singleton<Map>
    {
        public static IEnumerable<string> ChunksUpto(string str, int maxChunkSize)
        {
            for (var i = 0; i < str.Length; i += maxChunkSize)
                yield return str.Substring(i, Math.Min(maxChunkSize, str.Length - i));
        }

        public string index = "03";
        public string resStr = "Assets/Res/maps/data/03.txt";
        public enum ItemType { Road, Left, Right, Cross, T }

        public class Item
        {
            public ItemType type;
            public int num = 1;
            public List<GameObject> prefabs;
        }

        public List<Item> items = new List<Item>();

        public void Generate()
        {
            Str = Addressables.LoadAssetAsync<TextAsset>(resStr).WaitForCompletion().text;
            Str = Encoding.ASCII.GetString(Convert.FromBase64String(Str));
            Arr = ChunksUpto(Str, 28).ToArray();
        }

        public enum TileType { Wall = 0, Road, Fill, None }

        public TileType Get(int x, int y)
        {
            if (string.IsNullOrEmpty(Str)) Generate();
            if (x < 0 || x > 27) return TileType.None;
            if (y < 0 || y > 30) return TileType.None;
            var c = Arr[y][x];
            if (c == '|') return TileType.Wall;
            if (c == '_') return TileType.Fill;
            return TileType.Road;
        }

        public static string[] Arr { get; set; }
        public static string Str { get; set; }
    }
}
