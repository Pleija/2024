﻿using Runner.Consumable;
using UnityEngine;
using UnityEngine.AddressableAssets;
#if UNITY_ANALYTICS
using UnityEngine.Analytics;
#endif

namespace Runner.UI.Shop
{
    public class ShopItemList : ShopList
    {
        public static Consumable.Consumable.ConsumableType[] s_ConsumablesTypes =
            System.Enum.GetValues(typeof(Consumable.Consumable.ConsumableType)) as Consumable.Consumable.ConsumableType
                [];

        public override void Populate()
        {
            m_RefreshCallback = null;
            foreach (Transform t in listRoot) Destroy(t.gameObject);

            for (var i = 0; i < s_ConsumablesTypes.Length; ++i) {
                var c = ConsumableDatabase.GetConsumbale(s_ConsumablesTypes[i]);
                if (c != null)
                    Addressables.LoadAssetAsync<GameObject>(prefabItem).Completed += (op) => {
                        if (op.Result == null) {
                            Debug.LogWarning(string.Format("Unable to load item shop list {0}.",
                                prefabItem.RuntimeKey));
                            return;
                        }
                        var newEntry = op.Result.Instantiate().OnDestroyRelease(op);
                        newEntry.transform.SetParent(listRoot, false);
                        var itm = newEntry.GetComponent<ShopItemListItem>();
                        itm.buyButton.image.sprite = itm.buyButtonSprite;
                        itm.nameText.text = c.GetConsumableName();
                        itm.pricetext.text = c.GetPrice().ToString();

                        if (c.GetPremiumCost() > 0) {
                            itm.premiumText.transform.parent.gameObject.SetActive(true);
                            itm.premiumText.text = c.GetPremiumCost().ToString();
                        }
                        else {
                            itm.premiumText.transform.parent.gameObject.SetActive(false);
                        }
                        itm.icon.sprite = c.icon;
                        itm.countText.gameObject.SetActive(true);
                        itm.buyButton.onClick.AddListener(delegate() {
                            Buy(c);
                        });
                        m_RefreshCallback += delegate() {
                            RefreshButton(itm, c);
                        };
                        RefreshButton(itm, c);
                    };
            }
        }

        public void RefreshButton(ShopItemListItem itemList, Consumable.Consumable c)
        {
            var count = 0;
            PlayerData.instance.consumables.TryGetValue(c.GetConsumableType(), out count);
            itemList.countText.text = count.ToString();

            if (c.GetPrice() > PlayerData.instance.coins) {
                itemList.buyButton.interactable = false;
                itemList.pricetext.color = Color.red;
            }
            else {
                itemList.pricetext.color = Color.black;
            }

            if (c.GetPremiumCost() > PlayerData.instance.premium) {
                itemList.buyButton.interactable = false;
                itemList.premiumText.color = Color.red;
            }
            else {
                itemList.premiumText.color = Color.black;
            }
        }

        public void Buy(Consumable.Consumable c)
        {
            PlayerData.instance.coins.Value -= c.GetPrice();
            PlayerData.instance.premium.Value -= c.GetPremiumCost();
            PlayerData.instance.Add(c.GetConsumableType());
            PlayerData.instance.Save();
#if UNITY_ANALYTICS // Using Analytics Standard Events v0.3.0
            var transactionId = System.Guid.NewGuid().ToString();
            var transactionContext = "store";
            var level = PlayerData.instance.rank.ToString();
            var itemId = c.GetConsumableName();
            var itemType = "consumable";
            var itemQty = 1;
            AnalyticsEvent.ItemAcquired(AcquisitionType.Soft, transactionContext, itemQty, itemId, itemType, level,
                transactionId);
            if (c.GetPrice() > 0)
                AnalyticsEvent.ItemSpent(AcquisitionType.Soft,                           // Currency type
                    transactionContext, c.GetPrice(), itemId, PlayerData.instance.coins, // Balance
                    itemType, level, transactionId);
            if (c.GetPremiumCost() > 0)
                AnalyticsEvent.ItemSpent(AcquisitionType.Premium,                                // Currency type
                    transactionContext, c.GetPremiumCost(), itemId, PlayerData.instance.premium, // Balance
                    itemType, level, transactionId);
#endif
            Refresh();
        }
    }
}
