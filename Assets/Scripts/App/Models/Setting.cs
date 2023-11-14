using System;
using System.Collections.Generic;
using SqlCipher4Unity3D;
using UniRx;

namespace App.Models
{
    public class Setting : DataModel<Setting>
    {
        // 大写字母开头从 ScriptableObject asset 获取
        public StringReactiveProperty ResVersion = "";
        public StringReactiveProperty RegisterServer = "";
        public List<string> Servers = new List<string>();
        public List<string> RoomServers = new List<string>();
    }
}
