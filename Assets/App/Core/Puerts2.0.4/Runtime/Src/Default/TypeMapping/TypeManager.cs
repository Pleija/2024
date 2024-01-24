/*
 * Tencent is pleased to support the open source community by making Puerts available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
 * Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms.
 * This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
 */

#if !EXPERIMENTAL_IL2CPP_PUERTS || !ENABLE_IL2CPP

#region
using System;
using System.Collections.Generic;
using System.Reflection;
using Puerts.TypeMapping;
#endregion

namespace Puerts
{
    internal class TypeManager
    {
        internal class GenericWrapperTree
        {
            private static Dictionary<Type, Node>
                    definitionTypeNodes = new Dictionary<Type, Node>();

            public static Type FindWrapperDefinition(Type genericType)
            {
                var typeDefinition = genericType.GetGenericTypeDefinition();
                if (!definitionTypeNodes.ContainsKey(typeDefinition)) return null;
                var genericArgumentsType = genericType.GetGenericArguments();
                var node = definitionTypeNodes[typeDefinition];

                foreach (var type_ in genericArgumentsType) {
                    var type = type_;
                    if (type == null) type = typeof(NativeObjectType);
                    if (!node.Branchs.ContainsKey(type)) return null;
                    node = node.Branchs[type];
                }
                return node.WrapperTypeDefinition;
            }

            public static void AddWrapperTypeDefinition(Type typeDefinition,
                Type[] genericArgumentsType, Type wrapperTypeDefinition)
            {
                Node node;

                if (!definitionTypeNodes.ContainsKey(typeDefinition)) {
                    node = new Node();
                    definitionTypeNodes.Add(typeDefinition, node);
                }
                else {
                    node = definitionTypeNodes[typeDefinition];
                }

                foreach (var type_ in genericArgumentsType) {
                    var type = type_;
                    if (type == null) type = typeof(NativeObjectType);
                    if (!node.Branchs.ContainsKey(type)) node.Branchs.Add(type, new Node());
                    node = node.Branchs[type];
                }
                node.WrapperTypeDefinition = wrapperTypeDefinition;
            }

            private class NativeObjectType { }

            private class Node
            {
                public Dictionary<Type, Node> Branchs = new Dictionary<Type, Node>();
                public Type WrapperTypeDefinition;
            }
        }

        internal RegisterInfoManager RegisterInfoManager;
        internal TypeRegister TypeRegister;

        internal void AddRegisterInfoGetter(Type type, Func<RegisterInfo> getter)
        {
            RegisterInfoManager.Add(type, getter);
        }

        public TypeManager(JsEnv jsEnv)
        {
            this.jsEnv = jsEnv;
            RegisterInfoManager = new RegisterInfoManager();
            TypeRegister = new TypeRegister(jsEnv, RegisterInfoManager);
#if (UNITY_WSA && !ENABLE_IL2CPP) && !UNITY_EDITOR
            var assembliesUsorted = Utils.GetAssemblies();
#else
            assemblies.Add(Assembly.GetExecutingAssembly());
            var assembliesUsorted = AppDomain.CurrentDomain.GetAssemblies();
#endif
            AddAssemblieByName(assembliesUsorted, "mscorlib,"); //为了让这几个程序集排前面
            AddAssemblieByName(assembliesUsorted, "System,");
            AddAssemblieByName(assembliesUsorted, "System.Core,");
            foreach (var assembly in assembliesUsorted)
                if (!assemblies.Contains(assembly))
                    assemblies.Add(assembly);
        }

        private int arrayTypeId = -1;

        internal void InitArrayTypeId()
        {
            arrayTypeId = TypeRegister.InitArrayTypeId(GetTypeId(jsEnv.isolate, typeof(Array)));
        }

        private void AddAssemblieByName(IEnumerable<Assembly> assembliesUsorted, string name)
        {
            foreach (var assemblie in assembliesUsorted)
                if (assemblie.FullName.StartsWith(name) && !assemblies.Contains(assemblie)) {
                    assemblies.Add(assemblie);
                    break;
                }
        }

#if (UNITY_WSA && !ENABLE_IL2CPP) && !UNITY_EDITOR
        public static List<Assembly> GetAssemblies()
        {
            List<Assembly> assembliesCache = null;
            System.Threading.Tasks.Task t = new System.Threading.Tasks.Task(
                () => {
                    assembliesCache = GetAssemblyList().Result;
                }
            );
            t.Start();
            t.Wait();
            return assembliesCache;
        }

        public static async System.Threading.Tasks.Task<List<Assembly>> GetAssemblyList()
        {
            List<Assembly> assemblies = new List<Assembly>();
            //return assemblies;
            var files =
                    await Windows.ApplicationModel.Package.Current.InstalledLocation.GetFilesAsync();
            if (files == null) return assemblies;

            foreach (var file in files.Where(file => file.FileType == ".dll" || file.FileType == ".exe")) {
                try {
                    assemblies.Add(Assembly.Load(new AssemblyName(file.DisplayName)));
                }
                catch (Exception ex) {
                    System.Diagnostics.Debug.WriteLine(ex.Message);
                }
            }
            return assemblies;
        }
#endif
        internal Type GetType(string className, bool isQualifiedName = false)
        {
            var type = Type.GetType(className, false);
            if (type != null) return type;

            foreach (var assembly in assemblies) {
                type = assembly.GetType(className);
                if (type != null) return type;
            }
            var p1 = className.IndexOf('[');

            if (p1 > 0 && !isQualifiedName) {
                var qualified_name = className.Substring(0, p1 + 1);
                var generic_params = className.Substring(
                            p1 + 1, className.Length - qualified_name.Length - 1)
                        .Split(',');

                for (var i = 0; i < generic_params.Length; i++) {
                    var generic_param = GetType(generic_params[i].Trim());
                    if (generic_param == null) return null;
                    if (i != 0) qualified_name += ", ";
                    qualified_name =
                            qualified_name + "[" + generic_param.AssemblyQualifiedName + "]";
                }
                qualified_name += "]";
                return GetType(qualified_name, true);
            }
            return null;
        }

        private readonly Dictionary<Type, int> typeIdMap = new Dictionary<Type, int>();
        private readonly Dictionary<int, Type> typeMap = new Dictionary<int, Type>();
        private readonly JsEnv jsEnv;
        private readonly List<Assembly> assemblies = new List<Assembly>();

        public int GetTypeId(IntPtr isolate, Type type, out bool isFirst)
        {
            if (type.IsArray) {
                isFirst = false;
                return arrayTypeId;
            }
            int typeId;
            isFirst = false;

            if (!typeIdMap.TryGetValue(type, out typeId)) {
                isFirst = true;
                var baseTypeId = -1;
                if (type.BaseType != null) baseTypeId = GetTypeId(isolate, type.BaseType);
                typeId = TypeRegister.RegisterType(type, baseTypeId, false);
                typeIdMap[type] = typeId;
                typeMap[typeId] = type;
            }
            return typeId;
        }

        public bool IsArray(int typeId) => typeId == arrayTypeId;

        public int GetTypeId(IntPtr isolate, Type type)
        {
            bool isFirst;
            return GetTypeId(isolate, type, out isFirst);
        }

        public Type GetType(int typeId)
        {
            if (typeId == arrayTypeId) return typeof(Array);
            return typeMap[typeId];
        }
    }
}

#endif
