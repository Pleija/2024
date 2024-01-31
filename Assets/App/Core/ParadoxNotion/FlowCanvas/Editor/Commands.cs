﻿#if UNITY_EDITOR

#region
#if UNITY_EDITOR
using NodeCanvas.Editor;
#endif
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEditor;
#endregion

namespace FlowCanvas.Editor
{
    public static class Commands
    {
        ///----------------------------------------------------------------------------------------------
        [InitializeOnLoadMethod]
        public static void SetFlowCanvasDefine()
        {
            DefinesManager.SetDefineActiveForCurrentTargetGroup("FLOWCANVAS", true);
        }

        ///----------------------------------------------------------------------------------------------
        [MenuItem("Tools/ParadoxNotion/FlowCanvas/Create/Global Scene Blackboard", false, 11)]
        public static void CreateGlobalSceneBlackboard()
        {
            Selection.activeObject = GlobalBlackboard.Create();
        }

        [MenuItem("Tools/ParadoxNotion/FlowCanvas/Preferred Types Editor")]
        public static void ShowPrefTypes()
        {
            TypePrefsEditorWindow.ShowWindow();
        }

        [MenuItem("Tools/ParadoxNotion/FlowCanvas/Graph Console")]
        public static void OpenConsole()
        {
            GraphConsole.ShowWindow();
        }

        [MenuItem("Tools/ParadoxNotion/FlowCanvas/Graph Explorer")]
        public static void OpenExplorer()
        {
            GraphExplorer.ShowWindow();
        }

        [MenuItem("Tools/ParadoxNotion/FlowCanvas/Graph Refactor")]
        public static void OpenRefactor()
        {
            GraphRefactor.ShowWindow();
        }

        [MenuItem("Tools/ParadoxNotion/FlowCanvas/Active Owners Overview")]
        public static void OpenOwnersOverview()
        {
            ActiveOwnersOverview.ShowWindow();
        }

        [MenuItem("Tools/ParadoxNotion/FlowCanvas/External Inspector Panel")]
        public static void ShowExternalInspector()
        {
            ExternalInspectorWindow.ShowWindow();
        }

        ///----------------------------------------------------------------------------------------------
        [MenuItem("Tools/ParadoxNotion/FlowCanvas/Welcome Window")]
        public static void ShowWelcome()
        {
            WelcomeWindow.ShowWindow(typeof(FlowScript));
        }

        [MenuItem("Tools/ParadoxNotion/FlowCanvas/Website...")]
        public static void VisitWebsite()
        {
            Help.BrowseURL("https://flowcanvas.paradoxnotion.com");
        }
    }
}

#endif
