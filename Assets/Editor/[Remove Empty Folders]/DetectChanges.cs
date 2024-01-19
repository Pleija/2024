using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace Editors
{
    public class DetectChanges : AssetPostprocessor
    {
        private static void OnPostprocessAllAssets(string[] importedAssets, string[] deletedAssets,
            string[] movedAssets, string[] movedFromAssetPaths)
        {
            //        if ( importedAssets.FirstOrDefault( str => str.Contains( ".js" ) ) != null ) {
            //            if ( Main.IsReady ) {
            //                Main.js.ClearModuleCache();
            //                Main.js.Eval( "require('index')" );
            //            }
            //        }

            //        foreach (string str in importedAssets)
            //        {
            //            if(!str.Contains(".js")) continue;
            //            Debug.Log("Reimported Asset: " + str);
            //
            ////            string[] splitStr = str.Split('/', '.');
            ////
            ////            string folder = splitStr[splitStr.Length-3];
            ////            string fileName = splitStr[splitStr.Length-2];
            ////            string extension = splitStr[splitStr.Length-1];
            ////            Debug.Log("File name: " + fileName);
            ////            Debug.Log("File type: " + extension);
            //        }
            //
            //foreach (var str in deletedAssets)
            if (deletedAssets.Any()) Debug.Log("Deleted Asset: " + deletedAssets.JoinStr("\n"));

            if (movedAssets.Any()) {
                var s = new List<string>();
                for (var i = 0; i < movedAssets.Length; i++)
                    s.Add("Moved Asset: " + movedAssets[i] + " from: " + movedFromAssetPaths[i]);
                Debug.Log(s.JoinStr("\n"));
            }
            if (deletedAssets.Any() || movedAssets.Any()) RemoveEmptyFolders.Clear();
        }
    }
}
