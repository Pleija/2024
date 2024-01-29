/*
 * Tencent is pleased to support the open source community by making InjectFix available.
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.  All rights reserved.
 * InjectFix is licensed under the MIT License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms.
 * This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
 */

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using App;
using Gen;
using Runner;
using Sirenix.Utilities;
using SqlCipher4Unity3D;
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
#endif
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.ResourceManagement.ResourceProviders;

//1、配置类必须打[Configure]标签
//2、必须放Editor目录
namespace Puerts
{
    [Configure]
    public class ExamplesCfg
    {
        [Binding]
        private static IEnumerable<Type> Bindings => new List<Type>() {
#if UNITY_EDITOR
                    typeof(EditorApplication),
                    typeof(EditorSceneManager),
                    typeof(AssetDatabase),
#endif
                }.Union(GenTypes.Bindings)
                .Distinct();

        [BlittableCopy]
        private static IEnumerable<Type> Blittables => new List<Type>() {
            //打开这个可以优化Vector3的GC，但需要开启unsafe编译
            //typeof(Vector3),
        };

        [Filter]
        private static bool FilterMethods(System.Reflection.MemberInfo mb)
        {
            // 排除 MonoBehaviour.runInEditMode, 在 Editor 环境下可用发布后不存在
            if (mb.DeclaringType == typeof(MonoBehaviour) && mb.Name == "runInEditMode")
                return true;
            if (mb.DeclaringType == typeof(Type)
                && (mb.Name == "MakeGenericSignatureType" || mb.Name == "IsCollectible"))
                return true;

            if (mb.DeclaringType == typeof(System.IO.File)) {
                if (mb.Name == "SetAccessControl" || mb.Name == "GetAccessControl")
                    return true;
                else if (mb.Name == "Create") return true;
            }
            return false;
        }
    }
}
