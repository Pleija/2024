using System.Collections;
using Runner.Missions;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

namespace Runner.UI
{
    public class MissionUI : Singleton<MissionUI>
    {
        public RectTransform missionPlace;
        public AssetReference missionEntryPrefab;
        public AssetReference addMissionButtonPrefab;

        public IEnumerator Open()
        {
            gameObject.SetActive(true);
            foreach (Transform t in missionPlace)
                Addressables.ReleaseInstance(t.gameObject);

            for (var i = 0; i < 3; ++i)
                if (PlayerData.instance.missions.Count > i) {
                    var op = Addressables.LoadAssetAsync<GameObject>(missionEntryPrefab);
                    yield return op;

                    if (op.Result == null) {
                        Debug.LogWarning(string.Format("Unable to load mission entry {0}.",
                            missionEntryPrefab.Asset.name));
                        yield break;
                    }
                    var entry = (op.Result.Instantiate().OnDestroyRelease(op)).GetComponent<MissionEntry>();
                    entry.transform.SetParent(missionPlace, false);
                    entry.FillWithMission(PlayerData.instance.missions[i], this);
                }
                else {
                    var op = Addressables.LoadAssetAsync<GameObject>(addMissionButtonPrefab);
                    yield return op;

                    if (op.Result == null) {
                        Debug.LogWarning(string.Format("Unable to load button {0}.",
                            addMissionButtonPrefab.Asset.name));
                        yield break;
                    }
                    var obj = (op.Result.Instantiate().OnDestroyRelease(op)).GetComponent<AdsForMission>();
                    obj.missionUI = this;
                    obj.transform.SetParent(missionPlace, false);
                }
        }

        public void CallOpen()
        {
            gameObject.SetActive(true);
            StartCoroutine(Open());
        }

        public void Claim(MissionBase m)
        {
            PlayerData.instance.ClaimMission(m);

            // Rebuild the UI with the new missions
            StartCoroutine(Open());
        }

        public void Close()
        {
            gameObject.SetActive(false);
        }
    }
}
