using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Sirenix.Serialization;
using SqlCipher4Unity3D.SQLite.Attribute;
using UnityEngine;
using Sqlite3Statement = System.IntPtr;

namespace SqlCipher4Unity3D
{
    public class TypeDataScheme : DataScheme
    {
        public DataScheme Create(Type type) => this;
    }
}
