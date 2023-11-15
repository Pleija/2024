using System;
using System.Runtime.CompilerServices;

namespace NetApi
{
    public enum CallType { None = 0, Register, Login }
    public class RPC<T> where T : ITuple { }
    public class Reg : RPC<(CallType id, string timestamp)>{}
}
