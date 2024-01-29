#region
using SqlCipher4Unity3D;
using UniRx;
#endregion

namespace Models
{
    public class Players : DbTable<Players>
    {
        public StringReactiveProperty username = "";
        public IntReactiveProperty uid = 0;
        public StringReactiveProperty country = "";
        public IntReactiveProperty level = 0;
        public IntReactiveProperty rank = 0;
    }
}
