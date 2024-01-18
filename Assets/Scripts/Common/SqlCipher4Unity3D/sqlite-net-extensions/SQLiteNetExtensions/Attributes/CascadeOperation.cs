using System;

namespace SqlCipher4Unity3D.sqlite_net_extensions.SQLiteNetExtensions.Attributes
{
    [Flags]
    public enum CascadeOperation
    {
        None = 0,
        CascadeRead = 1 << 1,
        CascadeInsert = 1 << 2,
        CascadeDelete = 1 << 3,
        All = CascadeRead | CascadeInsert | CascadeDelete,
    }
}
