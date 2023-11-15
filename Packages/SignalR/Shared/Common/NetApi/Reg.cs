using System;
using System.Runtime.CompilerServices;

namespace NetApi
{
    public enum CallType { None = 0, Reg, Login }

    public interface IRpc<T>
    {
        T Data { get; set; }
        Action<T> OnResult { get; set; }
    }

    public class Rpc<T> : IRpc<T>, ITuple where T : ITuple, new()
    {
        public T Data { get; set; }
        public Action<T> OnResult { get; set; }
        public object this[int index] => Data[index];
        public int Length => Data.Length;
    }

    public class Reg : Rpc<(string query, string res)> { }
}
