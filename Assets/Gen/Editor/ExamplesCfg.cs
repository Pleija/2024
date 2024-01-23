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
            //todo: 每个泛型都要写一个, 否则导不出泛型的方法, https://github.com/Tencent/puerts/issues/963
            // typeof(DataModel<DataModelSample>),
            // typeof(Singleton<SingletonSample>),
            // typeof(Agent<AgentSample>),
            //

            typeof(JSObject),
            typeof(Uri),
            typeof(System.Object),
            typeof(UnityEngine.Object),
            typeof(XXTEA),
            typeof(Addressables),
            typeof(Enumerable),
            typeof(LinqExtensions),
            typeof(AsyncOperationHandle<SceneInstance>),
            typeof(AsyncOperationHandle<UnityEngine.Object>),
            typeof(AsyncOperationHandle<GameObject>),
            typeof(AsyncOperationHandle<Texture2D>),
            typeof(AsyncOperationHandle<Texture>),
            typeof(AsyncOperationHandle<>),
            typeof(AsyncOperationHandle),
            typeof(Application),
            typeof(object),
            typeof(GameObject),
            typeof(Transform),
            typeof(Component),
            typeof(UnityEngine.Object),
            typeof(Vector3),
            typeof(Vector2),
            typeof(Vector3Int),
            typeof(Vector2Int),
            typeof(Hashtable),
            typeof(Array),
            typeof(IList),
            typeof(List<>),
            typeof(List<string>),
            typeof(Dictionary<,>),
            typeof(Dictionary<string,string>),
            typeof(HashSet<>),
            typeof(HashSet<GameObject>),
            typeof(Debug),
            typeof(PuertsTest.TestClass),
            typeof(Vector3),
            typeof(Type),
            typeof(List<int>),
            typeof(Dictionary<string, List<int>>),
            typeof(PuertsTest.BaseClass),
            typeof(PuertsTest.DerivedClass),
            typeof(PuertsTest.BaseClassExtension),
            typeof(PuertsTest.MyEnum),
            typeof(Time),
            typeof(Transform),
            typeof(Component),
            typeof(GameObject),
            typeof(UnityEngine.Object),
            typeof(Delegate),
            typeof(object),
            typeof(Type),
            typeof(ParticleSystem),
            typeof(Canvas),
            typeof(RenderMode),
            typeof(Behaviour),
            typeof(MonoBehaviour),
            typeof(ScriptableObject),
            typeof(System.IO.File),
            typeof(System.IO.Path),
            typeof(System.IO.Directory),
            typeof(UnityEngine.Networking.UnityWebRequest),
            typeof(UnityEngine.Networking.DownloadHandler),
            typeof(UnityEngine.EventSystems.UIBehaviour),
            typeof(UnityEngine.UI.Selectable),
            typeof(UnityEngine.UI.Button),
            typeof(UnityEngine.UI.Text),
            typeof(UnityEngine.UI.Button.ButtonClickedEvent),
            typeof(UnityEngine.Events.UnityEvent),
            typeof(UnityEngine.UI.InputField),
            typeof(UnityEngine.UI.Toggle),
            typeof(UnityEngine.UI.Toggle.ToggleEvent),
            typeof(UnityEngine.Events.UnityEvent<bool>),
            typeof(PuertsDeclareTest.Plants.pumkinPeaShooter),
            typeof(PuertsDeclareTest.Plants.Shootable),
            typeof(PuertsDeclareTest.Zombies.Walkable),
            typeof(PuertsDeclareTest.Zombies.Flyable),
            typeof(PuertsDeclareTest.Zombies.BalloonZombie),
        }.Distinct();

        [BlittableCopy]
        private static IEnumerable<Type> Blittables => new List<Type>() {
            //打开这个可以优化Vector3的GC，但需要开启unsafe编译
            //typeof(Vector3),
        };

        [Filter]
        private static bool FilterMethods(System.Reflection.MemberInfo mb)
        {
            // 排除 MonoBehaviour.runInEditMode, 在 Editor 环境下可用发布后不存在
            if(mb.DeclaringType == typeof(MonoBehaviour) && mb.Name == "runInEditMode") return true;
            if(mb.DeclaringType == typeof(Type) &&
               (mb.Name == "MakeGenericSignatureType" || mb.Name == "IsCollectible"))
                return true;

            if(mb.DeclaringType == typeof(System.IO.File)) {
                if(mb.Name == "SetAccessControl" || mb.Name == "GetAccessControl")
                    return true;
                else if(mb.Name == "Create") return true;
            }
            return false;
        }
    }
}
