using System;
using System.IO;
using Sirenix.Utilities;
using UnityEditor;
using UnityEngine;
using Object = UnityEngine.Object;

namespace Runtime.Extensions
{
    public static partial class Paths
    {
        public static string GetFullPathWithoutExtension(this string path)
        {
            return System.IO.Path
                .Combine(System.IO.Path.GetDirectoryName(path)!, System.IO.Path.GetFileNameWithoutExtension(path))
                .Replace("\\", "/");
        }

        public static string GetFileNameWithoutExtension(this string path)
        {
            return Path.GetFileNameWithoutExtension(path);
        }

        public static string GetDirectoryName(this string path)
        {
            return Path.GetDirectoryName(path) + "";
        }

        public static string GetFullPath(this string path)
        {
            return Path.GetFullPath(path);
        }

        public static void DeleteEmptyDirs(this DirectoryInfo dir)
        {
            foreach (var d in dir.GetDirectories()) d.DeleteEmptyDirs();

            try {
                dir.Delete();
            }
            catch (IOException) { }
            catch (UnauthorizedAccessException) { }
        }

//    public static string CreateDirFromFilePath(this string path, bool isFile = true)
//    {
//        var dir = isFile ? Path.GetDirectoryName(path) : path;
//        if (!Directory.Exists(dir)) {
//            Directory.CreateDirectory(dir);
//        }
//
//        if (!Directory.Exists(dir)) {
//            throw new Exception("dir created fail");
//        }
//
//        return path; //.dataPathRoot();
//    }

        public static void RenameTo(this FileInfo fileInfo, string newName)
        {
            if (newName.IsNullOrWhitespace() || fileInfo == null) return;

            Debug.Log($"move to: {Path.Combine(fileInfo.Directory.FullName, newName)}");
            fileInfo.MoveTo(Path.Combine(fileInfo.Directory.FullName, newName));
#if UNITY_EDITOR
            AssetDatabase.Refresh();
#endif
        }

        public static string AssetPathNormal(this string path)
        {
#if UNITY_EDITOR
            if (Guid.TryParse(path, out var guid)) path = AssetDatabase.GUIDToAssetPath(path);
#endif
            return path.Replace('\\', '/').Replace(Application.dataPath, "Assets").Trim('/');
        }

        public static string PathCombine(this string path, params string[] names)
        {
            names.ForEach(s => path = Path.Combine(path, s));
            return path.Replace("\\", "/");
        }

        public static void RenameObject(this Object obj, string newName)
        {
            obj?.DataPathRoot().RenamePath(newName);
        }

        public static void RenamePath(this string fullpath, string newName)
        {
            if (fullpath.IsNullOrWhitespace()) return;

            if (!File.Exists(fullpath)) fullpath = fullpath.DataPathRoot();

            if (File.Exists(fullpath))
                new FileInfo(fullpath).RenameTo(newName);
            else
                Debug.Log($"{fullpath} not exists");
        }
    }
}