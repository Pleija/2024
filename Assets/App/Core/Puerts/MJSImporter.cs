/*
 * Tencent is pleased to support the open source community by making Puerts available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
 * Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms.
 * This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
 */

#if UNITY_EDITOR
#if UNITY_2018_1_OR_NEWER

#region
using System.IO;
using Puerts;
using UnityEngine;
#if UNITY_2020_2_OR_NEWER
using UnityEditor.AssetImporters;

#else
using UnityEditor.Experimental.AssetImporters;
#endif
#endregion

[ScriptedImporter(1, "mjs")]
public class MJSImporter : ScriptedImporter
{
    public override void OnImportAsset(AssetImportContext ctx)
    {
        var content = File.ReadAllText(ctx.assetPath).ToBase64();
        var subAsset = new TextAsset(content);
        ctx.AddObjectToAsset("text", subAsset);
        ctx.SetMainObject(subAsset);
#if ENABLE_CJS_AUTO_RELOAD
        JsEnv.ClearAllModuleCaches();
#endif
    }
}

#endif
#endif
