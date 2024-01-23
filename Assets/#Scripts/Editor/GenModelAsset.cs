#if UNITY_EDITOR
using System.Linq;
using System.Reflection;
using System.Runtime.Remoting.Messaging;
using Models;
using Sirenix.Utilities;
using SqlCipher4Unity3D;
using UnityEditor;
using UnityEngine;

namespace App.Models
{
    public class GenModelAsset
    {
        [InitializeOnEnterPlayMode]
        public static void Gen()
        {
            if (EditorApplication.isUpdating || EditorApplication.isCompiling) return;
            typeof(Game).Assembly.GetExportedTypes().Where(t =>
                typeof(ModelBase).IsAssignableFrom(t) && t != typeof(ModelBase) && !t.IsAbstract &&
                !t.IsGenericType).ForEach(type => {
                //Debug.Log(type.FullName);
                type.GetProperty("self",
                        BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
                    ?.GetValue(null, null);
            });
        }
    }
}
#endif
