using System.Linq;
using System.Reflection;
using Sirenix.Utilities;
using SqlCipher4Unity3D;
using UnityEditor;
using UnityEngine;

namespace App.Models
{
    public class GenModelAsset
    {
        [InitializeOnLoadMethod]
        public static void Gen()
        {
            typeof(Game).Assembly.GetExportedTypes().Where(t => typeof(ModelBase).IsAssignableFrom(t)).ForEach(type => {
                //Debug.Log(type.FullName);
                type.GetProperty("self", BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)!
                    .GetValue(null, null);
            });
        }
    }
}
