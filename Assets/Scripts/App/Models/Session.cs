using SqlCipher4Unity3D;

namespace App.Models
{
    public class Session: DataModel<Session>
    {
        public long timestamp;
        public long DefaultSeed;
        public string DefaultKey;
    }
}
