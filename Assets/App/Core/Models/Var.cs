using System;
using SqlCipher4Unity3D;
using UnityEngine;

namespace Models
{
    public class Var : DbTable<Var>
    {
        public string tableName = "";
        public int index = -1;
        public string guid = "";
        public object value = null;
        public Type type;
    }
}
