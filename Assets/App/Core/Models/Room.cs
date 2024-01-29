#region
using SqlCipher4Unity3D;
using UniRx;
#endregion

namespace Models
{
    public class Room : DbTable<Room>
    {
        public StringReactiveProperty roomId = "";
    }
}
