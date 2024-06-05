using UnityEngine;
using UnityEngine.Advertisements;

namespace Common
{
    public class UnityAdsScript : MonoBehaviour {

        string gameId = "5521217";
        bool testMode = true;

        void Start () {
            Advertisement.Initialize (gameId, testMode);
        }
    }
}
