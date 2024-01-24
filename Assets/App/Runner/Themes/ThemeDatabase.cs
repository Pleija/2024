#region
using System.Collections;
using System.Collections.Generic;
using UnityEngine.AddressableAssets;
#endregion

// Handles loading data from the Asset Bundle to handle different themes for the game
namespace Runner.Themes
{
    public class ThemeDatabase
    {
        public static Dictionary<string, ThemeData> themeDataList;
        public static bool m_Loaded;
        public static Dictionary<string, ThemeData> dictionnary => themeDataList;
        public static bool loaded => m_Loaded;

        public static ThemeData GetThemeData(string type)
        {
            ThemeData list;
            if (themeDataList == null || !themeDataList.TryGetValue(type, out list)) return null;
            return list;
        }

        public static IEnumerator LoadDatabase()
        {
            // If not null the dictionary was already loaded.
            if (themeDataList == null) {
                themeDataList = new Dictionary<string, ThemeData>();
                yield return Addressables.LoadAssetsAsync<ThemeData>("themeData", op => {
                    if (op != null)
                        if (!themeDataList.ContainsKey(op.themeName))
                            themeDataList.Add(op.themeName, op);
                });
                m_Loaded = true;
            }
        }
    }
}
