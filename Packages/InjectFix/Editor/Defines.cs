#if UNITY_EDITOR


using System.Collections.Generic;
using System.Linq;
using UnityEditor;

namespace Hotfix
{
    public static class DefineSymbols
    {
        private const char DEFINE_SEPARATOR = ';';
        private static readonly List<string> _allDefines = new List<string>();


        public static void Add(params string[] defines)
        {
            _allDefines.Clear();
            _allDefines.AddRange(GetDefines());
            _allDefines.AddRange(defines.Except(_allDefines));
            UpdateDefines(_allDefines);
        }

        public static bool Has(params string[] defines) => defines.All(x => GetDefines().Contains(x));

        public static void Remove(params string[] defines)
        {
            _allDefines.Clear();
            _allDefines.AddRange(GetDefines().Except(defines));
            UpdateDefines(_allDefines);
        }

        public static void Clear()
        {
            _allDefines.Clear();
            UpdateDefines(_allDefines);
        }

        private static IEnumerable<string> GetDefines() => PlayerSettings
            .GetScriptingDefineSymbolsForGroup(EditorUserBuildSettings.selectedBuildTargetGroup)
            .Split(DEFINE_SEPARATOR)
            .ToList();

        private static void UpdateDefines(List<string> allDefines) =>
            PlayerSettings.SetScriptingDefineSymbolsForGroup(EditorUserBuildSettings.selectedBuildTargetGroup,
                string.Join(DEFINE_SEPARATOR.ToString(), allDefines.ToArray()));
    }
}
#endif
