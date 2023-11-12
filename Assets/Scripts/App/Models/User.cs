using System;
using System.Collections.Generic;
using Sirenix.OdinInspector;
using SqlCipher4Unity3D;
using UniRx;
using UnityEngine.AddressableAssets;

namespace App.Models
{
    public class User : DataModel<User>
    {
        // 小写字母开头为本地数据,从数据库获取
        public StringReactiveProperty username ="";
        public IntReactiveProperty uid =0;
        public BoolReactiveProperty musicOn = true;
        public StringReactiveProperty key = Guid.NewGuid().ToString("N");
        public StringReactiveProperty loginServer ="";
        public StringReactiveProperty roomServer ="";
        public LongReactiveProperty loginTime = 0;
        public IntReactiveProperty level = 0;
        public IntReactiveProperty coin = 0;
        public IntReactiveProperty power = 0;
        public IntReactiveProperty money = 0;
        public IntReactiveProperty gold = 0;
        public IntReactiveProperty exp = 0;

        //
        [TableList(ShowIndexLabels = true)]
        public List<LevelItem> Levels = new List<LevelItem>();

        [Serializable, TableList]
        public class LevelItem
        {
            [TableColumnWidth(50, false)]
            public int exp;

            [TableColumnWidth(100, false)]
            public string name;

            public AssetReference icon;
        }
    }
}
