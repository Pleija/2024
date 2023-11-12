using System.Collections;
using System.Linq;
using Common;
#if UNITY_EDITOR
using UnityEditor.SceneManagement;
#endif
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace App
{
    public class LoadingUpdate : Singleton<LoadingUpdate>
    {
        public string PrivacyKey = "App.Privacy";
        public string FirstUpdateKey = "App.FirstUpdate";
        public GameObject privacyPanel;
        public Button agreeBtn;
        public Text prgText;
        public Slider progress;
        public GameObject offlinePanel;
        public Button retryBtn;

        public bool isAgreed {
            get => !(Application.isEditor || Debug.isDebugBuild) && PlayerPrefs.HasKey(PrivacyKey);
            set {
                if(value) {
                    PlayerPrefs.SetInt(PrivacyKey, 1);
                }
                else {
                    PlayerPrefs.DeleteKey(PrivacyKey);
                }
            }
        }

        private string preText;

        public string text {
            set {
                if(preText == value || string.IsNullOrEmpty(value)) return;
                preText = value;
                prgText.text = value;
                Debug.Log(value);
            }
        }

        private void Start()
        {
            privacyPanel.SetActive(!isAgreed);
            offlinePanel.SetActive(false);
            progress.gameObject.SetActive(false);
            agreeBtn.onClick.AddListener(() => {
                isAgreed = true;
                privacyPanel.SetActive(false);
                StartCoroutine(StartUpdate());
            });

            if(isAgreed) {
                StartCoroutine(StartUpdate());
            }
        }

        IEnumerator Offline()
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

        IEnumerator StartUpdate()
        {
            progress.gameObject.SetActive(true);
            text = "UPDATING...";
            progress.value = 0;

            if(Application.internetReachability == NetworkReachability.NotReachable &&
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

            if(needUpdate) {
                var p2 = Addressables.UpdateCatalogs(p1.Result, false);

                // while(p2.IsValid() && !p2.IsDone) {
                     text = $"Update Catalog...";
                //     progress.value = p2.PercentComplete;
                //     yield return null;
                // }
                yield return p2;
                if(p2.IsValid()) Addressables.Release(p2);
            }
            else if(p1.Status != AsyncOperationStatus.Succeeded &&
                    !PlayerPrefs.HasKey(FirstUpdateKey)) {
                StartCoroutine(Offline());
                yield break;
            }
            if(p1.IsValid()) Addressables.Release(p1);
            var p3 = Res.GetDownloadSizeAll();
            yield return p3;

            if(p3.Result > 0) {
                var p4 = Res.DownloadAll();
                var total = (float)p4.GetDownloadStatus().TotalBytes -
                    p4.GetDownloadStatus().DownloadedBytes;

                while(p4.IsValid() && !p4.IsDone) {
                    var current = (float)p4.GetDownloadStatus().TotalBytes -
                        p4.GetDownloadStatus().DownloadedBytes;
                    text = $"{(int)((1 - current / total) * 100)}% ({current / 1024 / 1024:f1}M)";
                    progress.value = 1f - (current / total);
                    yield return null;
                }
                Debug.Log($"Download Finish: {p4.Status}");

                if(p4.Status == AsyncOperationStatus.Succeeded &&
                   !PlayerPrefs.HasKey(FirstUpdateKey)) {
                    PlayerPrefs.SetInt(FirstUpdateKey, 1);
                }
                else if(!PlayerPrefs.HasKey(FirstUpdateKey)) {
                    StartCoroutine(Offline());
                    yield break;
                }
                if(p4.IsValid()) Addressables.Release(p4);
            }
            // else if(!PlayerPrefs.HasKey(FirstUpdateKey)) {
            //     StartCoroutine(Offline());
            //     yield break;
            // }
            else {
                Debug.Log("Don't need download");
            }
            text = "";
            progress.gameObject.SetActive(false);
            StartCoroutine(LoadNextScene());
        }

        IEnumerator LoadNextScene()
        {
            if(Application.isEditor) {
#if UNITY_EDITOR
                var p1 = EditorSceneManager.LoadSceneAsyncInPlayMode("Assets/Scenes/Start.unity",
                    new LoadSceneParameters() {
                        loadSceneMode = LoadSceneMode.Single
                    });

                // while(!p1.isDone && p1.) {
                //     progress.value = 0.9f - p1.progress;
                // }
#endif
                yield break;
            }
            var p = Addressables.LoadSceneAsync("Start");

            while(p.IsValid() && !p.IsDone) {
                progress.value = 0.9f - p.PercentComplete;
                yield return null;
            }
        }
    }
}
