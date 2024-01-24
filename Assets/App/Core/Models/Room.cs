#region
using SqlCipher4Unity3D;
using UniRx;
#endregion

namespace Models
{
    public class Room : DataModel<Room>
    {
        public StringReactiveProperty roomId = "";
    }
}
