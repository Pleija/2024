#region
using UnityEditor;
#endregion

namespace Editors
{
    [InitializeOnLoad]
    public class KeyStoreConfig
    {
        static KeyStoreConfig()
        {
            // PlayerSettings.Android.k
            PlayerSettings.Android.useCustomKeystore = true;
            PlayerSettings.Android.keystoreName = "Assets/Editor/user.keystore";
            PlayerSettings.Android.keystorePass = "7758520+";
            PlayerSettings.Android.keyaliasName = "tetroyal";
            PlayerSettings.Android.keyaliasPass = "7758520+";
        }
    }
}
