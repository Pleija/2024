using System;
using HashidsNet;
using MessagePack;

namespace Api
{
    public enum CallType { None = 0, GetTimestamp, Reg, Login }

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

    public class HashId
    {
        public static string chars =
            "8drpWsFJmD6IO+Qt7c9f5khwN4nPuiE1G2KbXTZYjSAog/HeBCylVq03azMRvLxU";

        private static Hashids m_Hashids;
        public static long seed = 1700054363;

        public static Hashids self {
            get {
                return m_Hashids ??= new Hashids(chars, 0, new PcgRandom(0, seed).Shuffle(chars));
            }
            set => m_Hashids = value;
        }
    }

    [MessagePackObject]
    public class RegQuery
    {
        [IgnoreMember]
        public long timestamp;

        [IgnoreMember]
        public long frame;

        [Key(0)]
        public string Timestamp => HashId.self.EncodeLong(timestamp, frame);
    }

    [MessagePackObject]
    public class RegResult
    {
        [IgnoreMember]
        public long timestamp;

        [Key(0)]
        public string Timestamp => HashId.self.EncodeLong(timestamp);
    }

    public interface IRpc
    {
        CallType id { get; }
    }

    public class Reg : Rpc<RegQuery, RegResult>, IRpc
    {
        public CallType id => CallType.Reg;
    }
}
