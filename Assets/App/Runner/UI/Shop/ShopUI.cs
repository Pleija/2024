#region
#if UNITY_ADS
using UnityEngine.Advertisements;
#endif
using Runner.Characters;
using Runner.Consumable;
using Runner.Game;
using Runner.Themes;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
#if UNITY_ANALYTICS
using UnityEngine.Analytics;
#endif
#endregion

namespace Runner.UI.Shop
{
    public class ShopUI : MonoBehaviour
    {
        public ConsumableDatabase consumableDatabase;
        public ShopItemList itemList;
        public ShopCharacterList characterList;
        public ShopAccessoriesList accessoriesList;
        public ShopThemeList themeList;

        [Header("UI")]
        public Text coinCounter;

        public Text premiumCounter;
        public Button cheatButton;
        public ShopList m_OpenList;
        public const int k_CheatCoins = 1000000;
        public const int k_CheatPremium = 1000;
#if UNITY_ADS
        public const int k_AdRewardCoins = 100;
#endif

        private void Start()
        {
            PlayerData.Create();
            consumableDatabase.Load();
            CoroutineHandler.StartStaticCoroutine(CharacterDatabase.LoadDatabase());
            CoroutineHandler.StartStaticCoroutine(ThemeDatabase.LoadDatabase());
#if UNITY_ANALYTICS
            AnalyticsEvent.StoreOpened(StoreType.Soft);
#endif
#if !UNITY_EDITOR && !DEVELOPMENT_BUILD
            //Disable cheating on non dev build outside of the editor
            cheatButton.interactable = false;
#else
            cheatButton.interactable = true;
#endif
            m_OpenList = itemList;
            itemList.Open();
        }

        private void Update()
        {
            coinCounter.text = PlayerData.instance.coins.ToString();
            premiumCounter.text = PlayerData.instance.premium.ToString();
        }

        public void OpenItemList()
        {
            m_OpenList.Close();
            itemList.Open();
            m_OpenList = itemList;
        }

        public void OpenCharacterList()
        {
            m_OpenList.Close();
            characterList.Open();
            m_OpenList = characterList;
        }

        public void OpenThemeList()
        {
            m_OpenList.Close();
            themeList.Open();
            m_OpenList = themeList;
        }

        public void OpenAccessoriesList()
        {
            m_OpenList.Close();
            accessoriesList.Open();
            m_OpenList = accessoriesList;
        }

        public void LoadScene(string scene)
        {
            Res.LoadScene(scene);
            //SceneManager.LoadScene(scene, LoadSceneMode.Single);
        }

        public void CloseScene()
        {
            SceneManager.UnloadSceneAsync("Shop");
            var loadoutState = GameManager.instance.topState as LoadoutState;
            if (loadoutState != null) loadoutState.Refresh();
        }

        public void CheatCoin()
        {
#if !UNITY_EDITOR && !DEVELOPMENT_BUILD
            return; //you can't cheat in production build
#endif
            PlayerData.instance.coins.Value += k_CheatCoins;
            PlayerData.instance.premium.Value += k_CheatPremium;
            PlayerData.instance.Save();
        }

#if UNITY_ADS
        public void ShowRewardedAd()
        {
            if (Advertisement.IsReady("rewardedVideo")) {
                var options = new ShowOptions { resultCallback = HandleShowResult };
                Advertisement.Show("rewardedVideo", options);
            }
        }

        private void HandleShowResult(ShowResult result)
        {
            switch (result) {
                case ShowResult.Finished:
                    Debug.Log("The ad was successfully shown.");
                    PlayerData.instance.coins += k_AdRewardCoins;
                    PlayerData.instance.Save();
                    break;
                case ShowResult.Skipped:
                    Debug.Log("The ad was skipped before reaching the end.");
                    break;
                case ShowResult.Failed:
                    Debug.LogError("The ad failed to be shown.");
                    break;
            }
        }
#endif
    }
}
