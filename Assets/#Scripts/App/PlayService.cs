using System.Threading.Tasks;
using GooglePlayGames;
using GooglePlayGames.BasicApi;
using Unity.Services.Authentication;
using Unity.Services.Core;
using UnityEngine;
using AuthenticationException = System.Security.Authentication.AuthenticationException;

namespace App
{
    public class PlayService : Singleton<PlayService>, IDontDestroyOnLoad
    {
#if UNITY_ANDROID

        //public string authCode { get; set; }

        private void Awake()
        {
            //Initialize PlayGamesPlatform
            PlayGamesPlatform.DebugLogEnabled = true;
            PlayGamesPlatform.Activate();
            LoginGooglePlayGames();
        }

        private async Task LinkWithGooglePlayGamesAsync(string authCode)
        {
            try {
                await AuthenticationService.Instance.LinkWithGooglePlayGamesAsync(authCode);
                Debug.Log("Link is successful.");
            }
            catch (AuthenticationException ex) when (ex.HResult == AuthenticationErrorCodes.AccountAlreadyLinked) {
                // Prompt the player with an error message.
                Debug.LogError("This user is already linked with another account. Log in instead.");
            }
            catch (AuthenticationException ex) {
                // Compare error code to AuthenticationErrorCodes
                // Notify the player with the proper error message
                Debug.LogException(ex);
            }
            catch (RequestFailedException ex) {
                // Compare error code to CommonErrorCodes
                // Notify the player with the proper error message
                Debug.LogException(ex);
            }
        }

        private async Task SignInWithGooglePlayGamesAsync(string authCode)
        {
            try {
                await AuthenticationService.Instance.SignInWithGooglePlayGamesAsync(authCode);
                Debug.Log("SignIn is successful.");
            }
            catch (AuthenticationException ex) {
                // Compare error code to AuthenticationErrorCodes
                // Notify the player with the proper error message
                Debug.LogException(ex);
            }
            catch (RequestFailedException ex) {
                // Compare error code to CommonErrorCodes
                // Notify the player with the proper error message
                Debug.LogException(ex);
            }
        }

        public void LoginGooglePlayGames()
        {
            PlayGamesPlatform.Instance.Authenticate((success) => {
                if (success == SignInStatus.Success) {
                    Debug.Log("Login with Google Play games successful.");
                    PlayGamesPlatform.Instance.RequestServerSideAccess(true, Sign);
                }
                else {
                    Error = "Failed to retrieve Google play games authorization code";
                    Debug.Log("Login Unsuccessful");
                }
            });
        }

        private async void Sign(string code)
        {
            Debug.Log("Authorization code: " + code);
            Token = code;
            if (AuthenticationService.Instance.IsSignedIn)
                await LinkWithGooglePlayGamesAsync(code);
            else
                await SignInWithGooglePlayGamesAsync(code);

            if (AuthenticationService.Instance.IsAuthorized) {
                var user = (PlayGamesLocalUser)Social.localUser;
                Debug.LogFormat("UserName: {0} id: {1} Avatar URL: {2} ", //Email: {3} Token: {4}
                    ((PlayGamesLocalUser)Social.localUser).userName, ((PlayGamesLocalUser)Social.localUser).id
                    , ((PlayGamesLocalUser)Social.localUser).AvatarURL
                    //,
                    // ((PlayGamesLocalUser)UnityEngine.Social.localUser).Email,
                    // ((PlayGamesLocalUser)UnityEngine.Social.localUser).GetIdToken()
                );
            }
            // This token serves as an example to be used for SignInWithGooglePlayGames
        }

        public string Error { get; set; }
        public string Token { get; set; }

        // Start is called before the first frame update
        private void Start()
        {
            // PlayGamesClientConfiguration config = new PlayGamesClientConfiguration.Builder()
            //     .RequestEmail()
            //     .RequestServerAuthCode(false /* Don't force refresh */)
            //     .RequestIdToken()
            //     .Build();
            //
            // PlayGamesPlatform.InitializeInstance(config);
            // PlayGamesPlatform.DebugLogEnabled = true;
            // PlayGamesPlatform.Activate();

            //AuthenticationService.Instance.SignInWithGooglePlayGamesAsync

            // Social.localUser.Authenticate((bool success) => {
            //     // handle success or failure
            //     if (success) {
            //         authCode = PlayGamesPlatform.Instance.GetServerAuthCode();
            //         Debug.Log($"google play authcode: {authCode}");
            //         Debug.Log("authenticate success");
            //         PlayGamesLocalUser user = (PlayGamesLocalUser)UnityEngine.Social.localUser;
            //         Debug.LogFormat("UserName: {0} id: {1} Avatar URL: {2} Email: {3} Token: {4}",
            //             ((PlayGamesLocalUser)UnityEngine.Social.localUser).userName,
            //             ((PlayGamesLocalUser)UnityEngine.Social.localUser).id,
            //             ((PlayGamesLocalUser)UnityEngine.Social.localUser).AvatarURL,
            //             ((PlayGamesLocalUser)UnityEngine.Social.localUser).Email,
            //             ((PlayGamesLocalUser)UnityEngine.Social.localUser).GetIdToken());
            //     }
            //     else {
            //         Debug.Log("authenticate failed");
            //     }
            // });
        }

        // 接入iOS Game Center账号
        private void AccessGameCenter()
        {
            Social.localUser.Authenticate(AccessGameCenterCallback);
        }

        private void AccessGameCenterCallback(bool success)
        {
            if (success) { }
            else { }
        }

        // Update is called once per frame
#endif
    }
}
