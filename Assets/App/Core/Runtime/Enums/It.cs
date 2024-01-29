using System;

namespace Runtime.Enums
{
    [Flags] // 类=item, 可重复
    public enum It
    {
        None = 2000, //
        Test,
        Faction,
        Parents,
        Parent
    }
}
