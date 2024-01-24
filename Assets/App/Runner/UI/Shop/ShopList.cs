#region
using UnityEngine;
using UnityEngine.AddressableAssets;
#endregion

// Base class for any list in the shop (Consumable, Character, Themes)
namespace Runner.UI.Shop
{
    public abstract class ShopList : MonoBehaviour
    {
        public delegate void RefreshCallback();
        public AssetReference prefabItem;
        public RectTransform listRoot;
        public RefreshCallback m_RefreshCallback;

        public void Open()
        {
            Populate();
            gameObject.SetActive(true);
        }

        public void Close()
        {
            gameObject.SetActive(false);
            m_RefreshCallback = null;
        }

        public void Refresh()
        {
            m_RefreshCallback();
        }

        public abstract void Populate();
    }
}
