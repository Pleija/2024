//using MessagePack;

namespace NetApi
{
    //[MessagePackObject]
    public class LoginRpc : RpcBase<LoginRpc>
    {
       // [Key(100)]
        public string tkid { get; set; }
    }
}