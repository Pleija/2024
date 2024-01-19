using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AddressableAssets;

namespace Runner.Characters
{
    /// <summary>
    ///     This allows us to store a database of all characters currently in the bundles, indexed by name.
    /// </summary>
    public class CharacterDatabase
    {
        public static Dictionary<string, Character> m_CharactersDict;
        public static Dictionary<string, Character> dictionary => m_CharactersDict;
        public static bool m_Loaded = false;
        public static bool loaded => m_Loaded;

        public static Character GetCharacter(string type)
        {
            Character c;
            if (m_CharactersDict == null || !m_CharactersDict.TryGetValue(type, out c))
                return null;
            return c;
        }

        public static IEnumerator LoadDatabase()
        {
            if (m_CharactersDict == null) {
                m_CharactersDict = new Dictionary<string, Character>();
                yield return Addressables.LoadAssetsAsync<GameObject>("characters", op => {
                    var c = op.GetComponent<Character>();
                    if (c != null) m_CharactersDict.Add(c.characterName, c);
                });
                m_Loaded = true;
            }
        }
    }
}
