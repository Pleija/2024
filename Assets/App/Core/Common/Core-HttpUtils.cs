using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using UnityEngine;
using UnityEngine.Networking;

public static partial class Core
{
    public static async Task<string> RequestUrl(string url, int timeout = 10) {
        //            WWWForm form = await BuildForm();
        //            string signedUrl = await BuildURL();
        Debug.Log($"request Url: {url}");
        using (var www = UnityWebRequest.Get(url)) {
            www.timeout = timeout;
            var operation = www.SendWebRequest(); //Web Request Sent

            //There may be a better wait to wait for the download to complete but this works for me for now
            //In an asyc function you can write an Inline Task to wait for. in this case I am waiting for the download data and waiting for 100 Milliseconds each loop
            while (!operation.isDone) await Task.Delay(100);

            var data = www.downloadHandler.text; //You can process text - bytes - etc...
            if (www.result != UnityWebRequest.Result.Success)
                Debug.LogError($"request: {url} error: {www.error} result: {www.result}");
            else
                Debug.Log($"request: {url} result: {data}");

            return data; //Processes the downloaded information
        }
    }

    static Action<string> m_SearchHelper;

    public static UriQuery ParseQueryString(Uri uri) {
        if (string.IsNullOrWhiteSpace(uri.Query)) return new UriQuery();

        //1.去除第一个前导?字符
        var dic = uri.Query.Substring(1)

            //2.通过&划分各个参数
            .Split(new[] {
                '&'
            }, StringSplitOptions.RemoveEmptyEntries)

            //3.通过=划分参数key和value,且保证只分割第一个=字符
            .Select(param => param.Split(new[] {
                '='
            }, 2, StringSplitOptions.RemoveEmptyEntries))

            //4.通过相同的参数key进行分组
            .GroupBy(part => part[0], part => part.Length > 1 ? part[1] : string.Empty)

            //5.将相同key的value以,拼接
            .ToDictionary(group => @group.Key, group => string.Join(",", @group));

        return new UriQuery(dic);
    }

    public static UriQuery ParseQueryString(string url) {
        if (string.IsNullOrWhiteSpace(url)) throw new ArgumentNullException(nameof(url));

        var uri = new Uri(url);
        return ParseQueryString(uri);
    }

    public static Action<string> SearchHelper(Action<string> action = null) {
        if (action != null) m_SearchHelper = action;

        return m_SearchHelper;
    }

    public class UriQuery : Dictionary<string, string>
    {
        public UriQuery() { }

        public UriQuery(Dictionary<string, string> data) {
            foreach (var item in data) this[item.Key] = item.Value;
        }

        public new string this[string index] {
            get => TryGetValue(index, out var ret) ? ret : null;
            set => base[index] = value;
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
}