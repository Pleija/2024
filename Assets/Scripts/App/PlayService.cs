using GooglePlayGames;
using GooglePlayGames.BasicApi;
using UnityEngine;

namespace App
{
    public class PlayService : MonoBehaviour
    {
        public string authCode { get; set; }

        // Start is called before the first frame update
        void Start()
        {
            PlayGamesClientConfiguration config = new PlayGamesClientConfiguration.Builder()
                .RequestEmail()
                .RequestServerAuthCode(false /* Don't force refresh */)
                .RequestIdToken()
                .Build();

            PlayGamesPlatform.InitializeInstance(config);
            PlayGamesPlatform.DebugLogEnabled = true;
            PlayGamesPlatform.Activate();
            Social.localUser.Authenticate((bool success) => {
                // handle success or failure
                if (success) {
                    authCode = PlayGamesPlatform.Instance.GetServerAuthCode();
                    Debug.Log($"google play authcode: {authCode}");
                    Debug.Log("authenticate success");
                    PlayGamesLocalUser user = (PlayGamesLocalUser)UnityEngine.Social.localUser;
                    Debug.LogFormat("UserName: {0} id: {1} Avatar URL: {2} Email: {3} Token: {4}",
                        ((PlayGamesLocalUser)UnityEngine.Social.localUser).userName,
                        ((PlayGamesLocalUser)UnityEngine.Social.localUser).id,
                        ((PlayGamesLocalUser)UnityEngine.Social.localUser).AvatarURL,
                        ((PlayGamesLocalUser)UnityEngine.Social.localUser).Email,
                        ((PlayGamesLocalUser)UnityEngine.Social.localUser).GetIdToken());
                }
                else {
                    Debug.Log("authenticate failed");
                }
            });
        }

        // 接入iOS Game Center账号
        private void AccessGameCenter()
        {
            UnityEngine.Social.localUser.Authenticate (AccessGameCenterCallback);
        }

        private void AccessGameCenterCallback(bool success)
        {
            if(success) {}
            else{}
        }

        // Update is called once per frame
        void Update()
        {
        
        }
    }
}
