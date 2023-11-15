using SqlCipher4Unity3D;
using UnityEngine;

namespace App.Models
{
    public class Session: DataModel<Session>
    {
        public long timestamp;
        public long DefaultSeed;
        [TextArea]
        public string DefaultKey;
    }
}
