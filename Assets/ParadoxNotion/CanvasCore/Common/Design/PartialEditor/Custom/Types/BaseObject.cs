using UnityEngine;

namespace ParadoxNotion
{
    public class BaseObject<T, T2> : ScriptableObject where T2 : BaseObject<T, T2>
    {
        public class Drawer : AssetReferenceDrawer<T, T2> { }
        public T value;

        public T Reference {
            get => value;
            set => value = this.value;
        }
    }
}
