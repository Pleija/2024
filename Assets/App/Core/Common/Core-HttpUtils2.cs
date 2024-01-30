using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

public static partial class AppCore
{
    public class UriQuery : Dictionary<string, string>
    {
        public new string this[string index] {
            get => TryGetValue(index, out var ret) ? ret : null;
            set => base[index] = value;
        }

        public UriQuery() { }

        public UriQuery(Dictionary<string, string> data) {
            foreach (var item in data) this[item.Key] = item.Value;
        }

        public static implicit operator string(UriQuery target) {
            return target.ToJson();
        }

        public string ToJson() {
            return JsonConvert.SerializeObject(this);
        }

        public override string ToString() {
            return ToJson();
        }

        // public static implicit operator UriQuery(Dictionary<string, string> target)
        // {
        //     var ret = new UriQuery();
        //     foreach(var item in target) {
        //         ret[item.Key] = item.Value;
        //     }
        //     return ret;
        // }
    }

    public static UriQuery ParseQueryString(Uri uri) {
        if (string.IsNullOrWhiteSpace(uri.Query)) return new UriQuery();

        //1.去除第一个前导?字符
        var dic = uri.Query.Substring(1)

            //2.通过&划分各个参数
            .Split(new char[] { '&' }, StringSplitOptions.RemoveEmptyEntries)

            //3.通过=划分参数key和value,且保证只分割第一个=字符
            .Select(param => param.Split(new char[] { '=' }, 2, StringSplitOptions.RemoveEmptyEntries))

            //4.通过相同的参数key进行分组
            .GroupBy(part => part[0], part => part.Length > 1 ? part[1] : string.Empty)

            //5.将相同key的value以,拼接
            .ToDictionary(group => group.Key, group => string.Join(",", group));

        return new UriQuery(dic);
    }

    public static UriQuery ParseQueryString(string url) {
        if (string.IsNullOrWhiteSpace(url)) throw new ArgumentNullException(nameof(url));

        var uri = new Uri(url);
        return ParseQueryString(uri);
    }

    static Action<string> m_SearchHelper;

    public static Action<string> SearchHelper(Action<string> action = null) {
        if (action != null) m_SearchHelper = action;

        return m_SearchHelper;
    }
}