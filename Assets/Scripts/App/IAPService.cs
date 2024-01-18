using System;
using Unity.Services.Core;
using Unity.Services.Core.Environments;
using UnityEngine;
using UnityEngine.Purchasing;
using UnityEngine.Purchasing.Extension;
using UnityEngine.UI;

namespace App
{
    //[DefaultExecutionOrder(-2000)]
    public class IAPService : Singleton<IAPService>, IDetailedStoreListener, IDontDestroyOnLoad
    {
        public Text informationText;
        private const string k_Environment = "production";

        private void Awake()
        {
            // Uncomment this line to initialize Unity Gaming Services.
            Initialize(OnSuccess, OnError);
        }

        private void Initialize(Action onSuccess, Action<string> onError)
        {
            try {
                var options = new InitializationOptions().SetEnvironmentName(k_Environment);
                UnityServices.InitializeAsync(options).ContinueWith(task => onSuccess());
            }
            catch (Exception exception) {
                onError(exception.Message);
            }
        }

        private void OnSuccess()
        {
            var text = "Congratulations!\nUnity Gaming Services has been successfully initialized.";
            if (informationText) informationText.text = text;
            Debug.Log(text);
            var builder = ConfigurationBuilder.Instance(StandardPurchasingModule.Instance());
            builder.AddProduct("10_premium", ProductType.Consumable,
                new IDs { { "10_premium_google_v1", GooglePlay.Name }, { "10_premium_ios", AppleAppStore.Name } });
            builder.AddProduct("50_premium", ProductType.Consumable,
                new IDs { { "50_premium_google_v1", GooglePlay.Name }, { "50_premium_ios", AppleAppStore.Name } });
            builder.AddProduct("100_premium", ProductType.Consumable,
                new IDs { { "100_premium_google_v1", GooglePlay.Name }, { "100_premium_ios", AppleAppStore.Name } });
            UnityPurchasing.Initialize(this, builder);
        }

        private void OnError(string message)
        {
            var text = $"Unity Gaming Services failed to initialize with error: {message}.";
            if (informationText) informationText.text = text;
            Debug.LogError(text);
        }

        private void Start()
        {
            if (UnityServices.State == ServicesInitializationState.Uninitialized) {
                var text = "Error: Unity Gaming Services not initialized.\n" +
                    "To initialize Unity Gaming Services, open the file \"InitializeGamingServices.cs\" " +
                    "and uncomment the line \"Initialize(OnSuccess, OnError);\" in the \"Awake\" method.";
                if (informationText) informationText.text = text;
                Debug.LogError(text);
            }
        }

        public IStoreController controller { get; set; }
        public IExtensionProvider extensions { get; set; }

        public void OnInitializeFailed(InitializationFailureReason error)
        {
            Debug.Log(informationText.text = $"IAP Initialize Failed: {error}");
        }

        public void OnInitializeFailed(InitializationFailureReason error, string message)
        {
            Debug.Log(informationText.text = $"IAP Initialize Failed: {error} => {message}");
        }

        public PurchaseProcessingResult ProcessPurchase(PurchaseEventArgs purchaseEvent)
        {
            Debug.Log($"Purchase: {purchaseEvent.purchasedProduct.definition.id}");
            return PurchaseProcessingResult.Complete;
        }

        public void OnPurchaseFailed(Product product, PurchaseFailureReason failureReason)
        {
            Debug.Log($"OnPurchaseFailed: {product.definition.id} => {failureReason}");
        }

        public void OnInitialized(IStoreController controller, IExtensionProvider extensions)
        {
            this.controller = controller;
            this.extensions = extensions;
            Debug.Log(informationText.text = $"IAP Initialized");
        }

        public void OnPurchaseFailed(Product product, PurchaseFailureDescription failureDescription)
        {
            Debug.Log($"OnPurchaseFailed: {product.definition.id} => {failureDescription}");
        }
    }
}
