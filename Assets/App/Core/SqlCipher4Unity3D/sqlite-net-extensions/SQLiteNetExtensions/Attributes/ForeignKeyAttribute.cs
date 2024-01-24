#region
using System;
using SqlCipher4Unity3D.SQLite.Attribute;
#endregion

namespace SqlCipher4Unity3D.sqlite_net_extensions.SQLiteNetExtensions.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class ForeignKeyAttribute : IndexedAttribute
    {
        public ForeignKeyAttribute(Type foreignType) => ForeignType = foreignType;
        public Type ForeignType { get; private set; }
    }
}
