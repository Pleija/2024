using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine.AddressableAssets;
using UnityEngine.AddressableAssets.ResourceLocators;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.ResourceManagement.ResourceLocations;

namespace Common
{
    public static class Res
    {
        // public static string[] Keys => ResourceLocators.SelectMany(x => x.Keys).Cast<string>()
        //     .Distinct().ToArray();

        public static IEnumerable<IResourceLocator> ResourceLocators {
            get {
                if (Addressables.ResourceLocators == null || !Addressables.ResourceLocators.Any())
                    Addressables.InitializeAsync().WaitForCompletion();
                return Addressables.ResourceLocators;
            }
        }

        public static AsyncOperationHandle<long> GetDownloadSizeAll() => Addressables.GetDownloadSizeAsync(Keys);

        public static AsyncOperationHandle DownloadAll() =>
            Addressables.DownloadDependenciesAsync(Keys, Addressables.MergeMode.Union, false);

        public static IEnumerable<string> Keys => ResourceLocators.SelectMany(x => x.Keys)
            .Select(key => Exists(key.ToString())?.PrimaryKey ?? null).Where(x => x != null).Distinct();

        public static IResourceLocation Exists<T>(string key, Type type = null) => Exists(key, typeof(T));

        public static IResourceLocation Exists(string key, Type type = null)
        {
            var result = new List<IResourceLocation>();
            foreach (var locator in ResourceLocators)
                if (locator.Locate(key, type, out var resourceLocations))
                    return resourceLocations.First();
            return null;
        }

        public static List<IResourceLocation> Exists<T>() => Exists(typeof(T));

        public static List<IResourceLocation> Exists(Type type)
        {
            var result = new List<IResourceLocation>();
            foreach (var locator in ResourceLocators)
            foreach (var key in locator.Keys)
                if (locator.Locate(key, type, out var resourceLocations))
                    if (resourceLocations.FirstOrDefault(x => !Guid.TryParse(x.PrimaryKey, out _)) is { } loc)
                        result.Add(loc);
            return result.Any() ? result : null;
        }
    }
}
