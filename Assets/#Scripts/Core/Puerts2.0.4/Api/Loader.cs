/*
 * Tencent is pleased to support the open source community by making Puerts available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
 * Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms.
 * This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
 */

using System.Net.Mime;
using UnityEditor;
using System.IO;
#if PUERTS_GENERAL || UNITY_EDITOR
#endif

namespace Puerts
{
#if ENABLE_IL2CPP
    [UnityEngine.Scripting.Preserve]
#endif
    public interface ILoader
    {
        bool FileExists(string filepath);
        string ReadFile(string filepath, out string debugPath);
    }

    public interface IModuleChecker
    {
        bool IsESM(string filepath);
    }

#if ENABLE_IL2CPP
    [UnityEngine.Scripting.Preserve]
#endif
    public interface IResolvableLoader
    {
        string Resolve(string specifier, string referrer);
    }

#if ENABLE_IL2CPP
    [UnityEngine.Scripting.Preserve]
#endif
    public interface IBuiltinLoadedListener
    {
        void OnBuiltinLoaded(JsEnv env);
    }

#if ENABLE_IL2CPP
    [UnityEngine.Scripting.Preserve]
#endif
    public class DefaultLoader : ILoader, IModuleChecker
    {
        private string root = "";
#if ENABLE_IL2CPP
        [UnityEngine.Scripting.Preserve]
#endif
        public DefaultLoader() { }
#if ENABLE_IL2CPP
        [UnityEngine.Scripting.Preserve]
#endif
        public DefaultLoader(string root) => this.root = root;

        private string PathToUse(string filepath)
        {
            return
                // .cjs asset is only supported in unity2018+
#if UNITY_2018_1_OR_NEWER
                filepath.EndsWith(".cjs") || filepath.EndsWith(".mjs") ? filepath.Substring(0, filepath.Length - 4) :
#endif
                    filepath;
        }

#if ENABLE_IL2CPP
        [UnityEngine.Scripting.Preserve]
#endif
        public bool FileExists(string filepath)
        {
            if (!Path.HasExtension(filepath)) filepath += ".mjs";
#if UNITY_WEBGL && !UNTIY_EDITOR
            return true;
#endif
#if PUERTS_GENERAL
            return File.Exists(Path.Combine(root, filepath));
#else
            var pathToUse = PathToUse(filepath);
            var exist = UnityEngine.Resources.Load(pathToUse) != null;
#if !PUERTS_GENERAL && UNITY_EDITOR && !UNITY_2018_1_OR_NEWER
            if (!exist) {
                UnityEngine.Debug.LogWarning("【Puerts】unity 2018- is using, if you found some js is not exist, rename *.cjs,*.mjs in the resources dir with *.cjs.txt,*.mjs.txt");
            }
#endif
            return exist;
#endif
        }

#if ENABLE_IL2CPP
        [UnityEngine.Scripting.Preserve]
#endif
        public string ReadFile(string filepath, out string debugPath)
        {
            if (!Path.HasExtension(filepath)) filepath += ".mjs";
#if PUERTS_GENERAL
            debugpath = Path.Combine(root, filepath);
            return File.ReadAllText(debugpath);
#else
            var pathToUse = PathToUse(filepath);
            var file = (UnityEngine.TextAsset)UnityEngine.Resources.Load(pathToUse);
            debugPath = Path.GetFullPath($"{root}/{filepath}");
#if UNITY_EDITOR
            if (file) debugPath = Path.GetFullPath(AssetDatabase.GetAssetPath(file));
#endif
            if (file && (Path.GetExtension(filepath) == ".proto" || Path.GetExtension(filepath) == ".mjs") &&
                file.text.IsBase64())
                return file.text.FromBase64();
#if UNITY_EDITOR_WIN || UNITY_STANDALONE_WIN
            debugpath = debugpath.Replace("/", "\\");
#endif
            return file == null ? null : file.text;
#endif
        }

        public bool IsESM(string filepath) => filepath.Length >= 4 && !filepath.EndsWith(".cjs");
    }
}
