#if ODIN_INSPECTOR

#region
using System.Linq;
using Sirenix.OdinInspector.Editor;
using Sirenix.Utilities;
using UnityEditor;
#endregion

namespace XNodeEditor
{
    [InitializeOnLoad]
    public static class OdinInspectorHelper
    {
        private static bool IsOdinExtensionLoaded;

        static OdinInspectorHelper()
        {
            EditorApplication.delayCall += () => {
                IsOdinExtensionLoaded = AssemblyUtilities.GetAllAssemblies()
                                .FirstOrDefault(x => x.GetName().Name == "XNodeEditorOdin")
                        != null;
                IsReady = true;
            };
        }

        public static bool IsReady { get; private set; }

        public static bool EnableOdinNodeDrawer =>
                IsOdinExtensionLoaded && InspectorConfig.Instance.EnableOdinInInspector;

        public static bool EnableOdinEditors => InspectorConfig.Instance.EnableOdinInInspector;
    }
}
#endif
