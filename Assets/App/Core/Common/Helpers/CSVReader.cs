using System.Collections.Generic;
using System.Text.RegularExpressions;
using UnityEngine;

namespace Runtime.Helpers
{
    public class CSVReader
    {
        static string SPLIT_RE = @",(?=(?:[^""]*""[^""]*"")*(?![^""]*""))";
        static string LINE_SPLIT_RE = @"\r\n|\n\r|\n|\r";
        static char[] TRIM_CHARS = { '\"' };

        static void Test() {
            var data = Read(Resources.Load<TextAsset>("example").text);
            for (var i = 0; i < data.Count; i++)
                Debug.Log("name " + data[i]["name"] + " " + "age " + data[i]["age"] + " " + "speed " + data[i]["speed"]
                    + " " + "desc " + data[i]["description"]);
        }

        public static List<Dictionary<string, object>> Read(string text) {
            var list = new List<Dictionary<string, object>>();

            //TextAsset data = Resources.Load(file) as TextAsset;
            var lines = Regex.Split(text, LINE_SPLIT_RE);
            if (lines.Length <= 1) return list;

            var header = Regex.Split(lines[0], SPLIT_RE);
            for (var i = 1; i < lines.Length; i++) {
                var values = Regex.Split(lines[i], SPLIT_RE);
                if (values.Length == 0 || values[0] == "") continue;

                var entry = new Dictionary<string, object>();
                for (var j = 0; j < header.Length && j < values.Length; j++) {
                    var value = values[j];
                    value = value.TrimStart(TRIM_CHARS).TrimEnd(TRIM_CHARS).Replace("\\", "");
                    object finalvalue = value;
                    int n;
                    float f;
                    if (int.TryParse(value, out n))
                        finalvalue = n;
                    else if (float.TryParse(value, out f)) finalvalue = f;

                    entry[header[j]] = finalvalue;
                }

                list.Add(entry);
            }

            return list;
        }
    }
}
