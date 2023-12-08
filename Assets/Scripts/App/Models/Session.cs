using SqlCipher4Unity3D;
using UniRx;
using UnityEngine;

namespace App.Models
{
    public class Session : DataModel<Session>
    {
        public LongReactiveProperty timestamp = 0;
        public LongReactiveProperty DefaultSeed = 0;

        //[TextArea]
        public string DefaultKey = "";
    }
}
