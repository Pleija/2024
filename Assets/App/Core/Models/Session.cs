#region
using SqlCipher4Unity3D;
using UniRx;
#endregion

namespace Models
{
    public class Session : DbTable<Session>
    {
        public LongReactiveProperty timestamp = 0;
        public LongReactiveProperty DefaultSeed = 0;

        //[TextArea]
        public string DefaultKey = "";
    }
}
