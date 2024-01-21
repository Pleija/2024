using SqlCipher4Unity3D;
using UniRx;

namespace Models
{
    public class Room : DataModel<Room>
    {
        public StringReactiveProperty roomId = "";
    }
}
