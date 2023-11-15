//using MessagePack;

using MessagePack;
using ProtoBuf;

namespace NetApi
{
    [MessagePackObject]
    public class MyClass
    {
        // Key attributes take a serialization index (or string name)
        // The values must be unique and versioning has to be considered as well.
        // Keys are described in later sections in more detail.
        [Key(0)]
        public int Age { get; set; }

        [Key(1)]
        public string FirstName { get; set; }

        [Key(2)]
        public string LastName { get; set; }

        // All fields or properties that should not be serialized must be annotated with [IgnoreMember].
        [IgnoreMember]
        public string FullName { get { return FirstName + LastName; } }
    }

    [ProtoContract]
    class Person
    {
        [ProtoMember(1)]
        public int Id { get; set; }

        [ProtoMember(2)]
        public string Name { get; set; }

        [ProtoMember(3)]
        public Address Address { get; set; }
    }

    [ProtoContract]
    class Address
    {
        [ProtoMember(1)]
        public string Line1 { get; set; }

        [ProtoMember(2)]
        public string Line2 { get; set; }
    }

    //[MessagePackObject]
    public class LoginRpc : RpcBase<LoginRpc>
    {
        // [Key(100)]
        public string tkid { get; set; }
    }
}
