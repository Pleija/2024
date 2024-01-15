using SqlCipher4Unity3D;
using UniRx;

namespace Models
{
    public class Players : DataModel<Players>
    {
        public StringReactiveProperty username = "";
        public IntReactiveProperty uid = 0;
        public StringReactiveProperty country = "";
        public IntReactiveProperty level = 0;
        public IntReactiveProperty rank = 0;
    }
}
