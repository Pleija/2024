using System.Collections.Generic;
using Sirenix.Serialization;
using SqlCipher4Unity3D;
using UniRx;

namespace App.Models
{
    public class Game : DataModel<Game>
    {
        public LongReactiveProperty startTime = 0;
        public IntReactiveProperty frameCount = 0;
        public IntReactiveProperty currentFrame = 0;

        [OdinSerialize]
        public Dictionary<int, (string self, string enemy)> frameData;
    }
}
