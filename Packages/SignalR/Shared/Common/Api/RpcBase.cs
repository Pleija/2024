using System;

//using MessagePack;

namespace Api
{
    [Serializable]
    //[MessagePackObject]
    public abstract class RpcBase<T> where T : RpcBase<T>
    {
       // [Key(0)]
       //
        public int Id { get; set; }
    }
}