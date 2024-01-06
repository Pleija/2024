using System;
using System.Collections;
using System.IO;
using System.Linq;
using System.Net.Configuration;
using Common;
using IngameDebugConsole;
using Runner;
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
#endif
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.Events;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace App
{
    public class Loading : Singleton<Loading>
    {
        public AssetReference nextScene;
        public AssetReference prefab;
        public AssetReference testPrefab;

        //public GameObject prefabObj;
        public static string PrivacyKey = "App.Privacy";
        public static string FirstUpdateKey = "App.FirstUpdate";
        public static string VersionKey = "App.Version";
        public GameObject privacyPanel;
        public Button agreeBtn;
        public Text prgText;
        public Slider progress;
        public GameObject offlinePanel;
        public Button retryBtn;
        private static bool clicked;
        private static bool updated;

        public bool isAgreed {
            get => (!(Application.isEditor || Debug.isDebugBuild) || clicked) && PlayerPrefs.HasKey(PrivacyKey);
            set {
                clicked = value;
                if (value)
                    PlayerPrefs.SetInt(PrivacyKey, 1);
                else
                    PlayerPrefs.DeleteKey(PrivacyKey);
            }
        }

        private string preText;

        public string text {
            set {
                if (preText == value || string.IsNullOrEmpty(value)) return;
                preText = value;
                prgText.text = value.ToUpper();
                Debug.Log(value);
            }
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void DebugSetting()
        {
            if (Debug.isDebugBuild && !Application.isEditor && PlayerPrefs.GetString(VersionKey) != Application.version)
                Directory.Delete(Application.persistentDataPath + "/com.unity.addressables", true);

            if (Application.isEditor || Debug.isDebugBuild || PlayerPrefs.HasKey("App.Dev")) {
                Instantiate(Resources.Load("IngameDebugConsole"));
                return;
            }
            Debug.unityLogger.logEnabled = false;
        }

        private static bool m_Reloaded;
        public UnityEvent OnAwake;
        public UnityEvent OnStart;
        public float timer = 3.0f;
        public string privacyUrl = "https://static.pleija.com/docs/#/PrivacyPolicy";
        public string tosUrl = "https://static.pleija.com/docs/#/TermsOfService";
        //private float startTime;

        private void Awake()
        {
            OnAwake?.Invoke();
        }

        /// <summary>
        /// </summary>
        /// <param name="old"></param>
        /// <returns></returns>
        public static IEnumerator LoadNewPrefab(GameObject old)
        {
            //Instantiate(old);
            //SceneManager.UnloadSceneAsync(SceneManager.GetActiveScene()).completed += t => {
            SceneManager.LoadScene(0);
            //};
            yield break;

            // Addressables.Release(old);
            // yield return Addressables.InstantiateAsync("Update");
            // Destroy(old);
        }

        private void Start()
        {
            if (!m_Reloaded) {
                m_Reloaded = true;
                Addressables.InitializeAsync().WaitForCompletion();
                var loc = Res.Exists<GameObject>(prefab.RuntimeKey.ToString());
                Debug.Log($"Start Update: Reload => {loc != null}: {loc?.PrimaryKey}");
                Addressables.InstantiateAsync(testPrefab).WaitForCompletion();
                var testHandle = Addressables.InstantiateAsync(prefab);
                testHandle.Completed += h => {
                    h.Result.SetActive(false);
                };
                testHandle.WaitForCompletion();

                if (PlayerPrefs.HasKey(FirstUpdateKey) && loc != null &&
                    Application.version == PlayerPrefs.GetString(VersionKey)) {
                    Debug.Log("Reload Update prefab");
                    Addressables.InstantiateAsync(prefab).Completed += h => {
                        Debug.Log("replace prefab");
                        DoStart();
                        //gameObject.SetActive(false);
                    };
                    // var obj = Addressables.LoadAssetAsync<GameObject>(prefab).WaitForCompletion();
                    // //AssetBundle.UnloadAllAssetBundles(false);
                    // Instantiate(obj);
                    // Destroy(gameObject);
                    return;
                }
            }
            DoStart();
        }

        void DoStart()
        {
            Debug.Log("Start");
            OnStart?.Invoke();
            privacyPanel.SetActive(!isAgreed);
            offlinePanel.SetActive(false);
            progress.gameObject.SetActive(false);
            agreeBtn.onClick.AddListener(() => {
                isAgreed = true;
                privacyPanel.SetActive(false);
                StartCoroutine(StartUpdate());
            });
            if (isAgreed) StartCoroutine(StartUpdate());
        }

        public AsyncOperationHandle<GameObject> handle { get; set; }

        private IEnumerator Offline()
        {
            yield return new WaitForSeconds(1);
            progress.gameObject.SetActive(false);
            offlinePanel.SetActive(true);
            retryBtn.onClick.RemoveAllListeners();
            retryBtn.onClick.AddListener(() => {
                offlinePanel.SetActive(false);
                StartCoroutine(StartUpdate());
            });
        }

        private IEnumerator StartUpdate()
        {
            progress.gameObject.SetActive(true);
            text = "UPDATING...";
            progress.value = 0;

            if (Application.internetReachability == NetworkReachability.NotReachable &&
                !PlayerPrefs.HasKey(FirstUpdateKey)) {
                StartCoroutine(Offline());
                yield break;
            }
            yield return Addressables.InitializeAsync();
            var p1 = Addressables.CheckForCatalogUpdates(false);

            // while(p1.IsValid() && !p1.IsDone) {
            text = $"Check Update...";
            //     progress.value = p1.PercentComplete;
            //     yield return null;
            // }
            yield return p1;
            var needUpdate = p1.Status == AsyncOperationStatus.Succeeded && p1.Result.Any();

            if (needUpdate) {
                var p2 = Addressables.UpdateCatalogs(p1.Result, false);

                // while(p2.IsValid() && !p2.IsDone) {
                text = $"Update Catalog...";
                //     progress.value = p2.PercentComplete;
                //     yield return null;
                // }
                yield return p2;
                if (p2.IsValid()) Addressables.Release(p2);
            }
            else if (p1.Status != AsyncOperationStatus.Succeeded && !PlayerPrefs.HasKey(FirstUpdateKey)) {
                StartCoroutine(Offline());
                yield break;
            }
            if (p1.IsValid()) Addressables.Release(p1);
            var p3 = Res.GetDownloadSizeAll();
            yield return p3;

            if (p3.Result > 0) {
                var p4 = Res.DownloadAll();
                var total = (float)p4.GetDownloadStatus().TotalBytes - p4.GetDownloadStatus().DownloadedBytes;

                while (p4.IsValid() && !p4.IsDone) {
                    var current = (float)p4.GetDownloadStatus().TotalBytes - p4.GetDownloadStatus().DownloadedBytes;
                    text = $"{(int)((1 - current / total) * 100)}%" +
                        (current != 0 ? $" ({current / 1024 / 1024:f1}M)" : "");
                    progress.value = 1f - current / total;
                    yield return null;
                }
                Debug.Log($"Download Finish: {p4.Status}");
                if (p4.Status == AsyncOperationStatus.Succeeded && !PlayerPrefs.HasKey(FirstUpdateKey))
                    PlayerPrefs.SetInt(FirstUpdateKey, 1);

                if (p4.Status != AsyncOperationStatus.Succeeded && !PlayerPrefs.HasKey(FirstUpdateKey)) {
                    StartCoroutine(Offline());
                    yield break;
                }
                if (p4.Status == AsyncOperationStatus.Succeeded &&
                    Application.version != PlayerPrefs.GetString(VersionKey))
                    PlayerPrefs.SetString(VersionKey, Application.version);
                if (p4.IsValid()) Addressables.Release(p4);
                updated = true;

                //if (Res.Exists<GameObject>(updatePrefabName) is { } found /* &&
                   //                    Addressables.LoadAssetAsync<GameObject>(found).WaitForCompletion() is { } go*/) {
                    //SceneManager.LoadScene(0);
                    LoadScene();
                    // Addressables.InstantiateAsync(found).Completed += h => {
                    //     //Destroy(gameObject);
                    //     gameObject.SetActive(false);
                    // };
                    // Instantiate(go);
                    // Destroy(gameObject);
                    yield break;
               // }
            }
            // else if(!PlayerPrefs.HasKey(FirstUpdateKey)) {
            //     StartCoroutine(Offline());
            //     yield break;
            // }
            else {
                // if(!PlayerPrefs.HasKey(FirstUpdateKey)) {
                //     PlayerPrefs.SetInt(FirstUpdateKey, 1);
                // }
                if (Application.version != PlayerPrefs.GetString(VersionKey))
                    PlayerPrefs.SetString(VersionKey, Application.version);
                Debug.Log("Don't need download");
            }

            //progress.gameObject.SetActive(false);
            if (!PlayerPrefs.HasKey(FirstUpdateKey) && !Application.isEditor) {
                StartCoroutine(StartUpdate());
                yield break;
            }
            text = "Loading...";
            progress.value = 0;
            OnLoad?.Invoke();
        }

        public UnityEvent OnLoad = new UnityEvent();

        [SerializeField]
        private string updatePrefabName = "StartUpdate";

        public void LoadScene()
        {
            StartCoroutine(LoadNextScene());
        }

        private IEnumerator LoadNextScene()
        {
            if (Application.isEditor) {
#if UNITY_EDITOR
                var path = AssetDatabase.GetAssetPath(nextScene.editorAsset);
                var p1 = EditorSceneManager.LoadSceneAsyncInPlayMode(path /*"Assets/Scenes/Start.unity"*/,
                    new LoadSceneParameters() {
                        loadSceneMode = LoadSceneMode.Single,
                    });

                // while(!p1.isDone && p1.) {
                //     progress.value = 0.9f - p1.progress;
                // }
#endif
                yield break;
            }
            progress.value = 0;
            var p = Addressables.LoadSceneAsync(nextScene);
            //startTime = Time.realtimeSinceStartup;
            //var start = 0f;

            while (p.IsValid() && !p.IsDone) {
                // if(Time.realtimeSinceStartup - startTime >= timer / 100f) {
                //     start += 0.01f;
                //     startTime = Time.realtimeSinceStartup;
                // }
                progress.value = Mathf.Max(p.PercentComplete / 0.9f, progress.value += timer / 100f);
                yield return null;
            }
        }
    }
}
