using System;
using System.Diagnostics.Eventing.Reader;
using System.Runtime.CompilerServices;
using HashidsNet;
using MessagePack;

namespace NetApi
{
    public enum CallType { None = 0, Reg, Login }

    public interface IRpc<T1, T2>
    {
        T1 Query { get; set; }
        T2 Result { get; set; }
        Action<T2> OnResult { get; set; }
    }

    public class Rpc<T1, T2> : IRpc<T1, T2>
    {
        public T1 Query { get; set; }
        public T2 Result { get; set; }
        public Action<T2> OnResult { get; set; }
    }

    public class HashIdManager
    {
        public static string chars =
            "8drpWsFJmD6IO+Qt7c9f5khwN4nPuiE1G2KbXTZYjSAog/HeBCylVq03azMRvLxU";

        private static Hashids m_Hashids;
        public static long seed = 1700054363;

        public static Hashids self {
            get {
                return m_Hashids ??=
                    new Hashids(chars, 0, new PcgRandom(0, seed).Shuffle(chars));
            }
            set => m_Hashids = value;
        }
    }

    [MessagePackObject]
    public class RegQuery
    {
        [IgnoreMember]
        private string m_Timestamp;

        [Key(0)]
        public string Timestamp {
            get { return m_Timestamp; }
        }
    }

    public interface IRpc
    {
        CallType id { get; }
    }

    public class Reg : Rpc<string, string>, IRpc
    {
        public CallType id => CallType.Reg;
    }
}
