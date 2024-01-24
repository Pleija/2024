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
using System.Linq;
using System.Reflection;
#endregion

namespace Puerts
{
    internal class DelegateCreatorTree
    {
        private readonly Node root = new Node();

        private Node FindNode(Type[] types, bool createIfNotExisted)
        {
            var cur = root;
            Node next;

            for (var i = 0; i < types.Length; i++) {
                if (!cur.Branchs.TryGetValue(types[i], out next)) {
                    if (createIfNotExisted) {
                        next = new Node();
                        cur.Branchs.Add(types[i], next);
                    }
                    else {
                        return null;
                    }
                }
                cur = next;
            }
            return cur;
        }

        public void Add(Func<Type, IntPtr, Delegate> creator, params Type[] types)
        {
            var node = FindNode(types, true);
            node.Creator = creator;
        }

        public Func<Type, IntPtr, Delegate> Find(Type[] types)
        {
            var node = FindNode(types, false);
            return node == null ? null : node.Creator;
        }

        private class Node
        {
            public Dictionary<Type, Node> Branchs = new Dictionary<Type, Node>();
            public Func<Type, IntPtr, Delegate> Creator;
        }
    }

    internal class GenericDelegateFactory
    {
        private readonly JsEnv jsEnv;
        private DelegateCreatorTree ActionCreatorTree = new DelegateCreatorTree();
        private DelegateCreatorTree FuncCreatorTree = new DelegateCreatorTree();

        //无返回值泛型方法
        private MethodInfo[] genericAction;

        //泛型delegate适配器构造器的缓存
        private Dictionary<Type, Func<Type, IntPtr, Delegate>> genericDelegateCreatorCache =
                new Dictionary<Type, Func<Type, IntPtr, Delegate>>();

        //有返回值泛型方法
        private MethodInfo[] genericFunc;

        private Dictionary<IntPtr, WeakReference> nativePtrToGenericDelegate =
                new Dictionary<IntPtr, WeakReference>();

        static GenericDelegateFactory()
        {
            PrimitiveTypeTranslate.Init();
        }

        internal GenericDelegateFactory(JsEnv jsEnv) => this.jsEnv = jsEnv;

        //Prevent unity il2cpp code stripping
        private static void PreventStripping(object obj)
        {
            if (obj != null) {
                var gd = new GenericDelegate(IntPtr.Zero, null);
                gd.Action();
                gd.Action(obj);
                gd.Action(obj, obj);
                gd.Action(obj, obj, obj);
                gd.Action(obj, obj, obj, obj);
                gd.Func<object>();
                gd.Func<object, object>(obj);
                gd.Func<object, object, object>(obj, obj);
                gd.Func<object, object, object, object>(obj, obj, obj);
                gd.Func<object, object, object, object, object>(obj, obj, obj, obj);
            }
        }

        internal GenericDelegate ToGenericDelegate(IntPtr ptr)
        {
            WeakReference maybeOne;
            if (nativePtrToGenericDelegate.TryGetValue(ptr, out maybeOne) && maybeOne.IsAlive)
                return maybeOne.Target as GenericDelegate;
            var genericDelegate = new GenericDelegate(ptr, jsEnv);
            nativePtrToGenericDelegate[ptr] = new WeakReference(genericDelegate);
            return genericDelegate;
        }

        public void RemoveGenericDelegate(IntPtr ptr)
        {
            WeakReference maybeOne;
            if (nativePtrToGenericDelegate.TryGetValue(ptr, out maybeOne) && !maybeOne.IsAlive)
                nativePtrToGenericDelegate.Remove(ptr);
        }

        public void CloseAll()
        {
            foreach (var referKV in nativePtrToGenericDelegate) {
                var refer = referKV.Value;
                if (refer.IsAlive) (refer.Target as GenericDelegate).Close();
            }
        }

        internal bool IsJsFunctionAlive(IntPtr ptr)
        {
            WeakReference maybeOne;
            return nativePtrToGenericDelegate.TryGetValue(ptr, out maybeOne) && maybeOne.IsAlive;
        }

        private Delegate CreateDelegate(Type type, GenericDelegate genericDelegate,
            MethodInfo method)
        {
            Delegate ret;
            if (genericDelegate.TryGetDelegate(type, out ret)) return ret;
            ret = Delegate.CreateDelegate(type, genericDelegate, method);
            genericDelegate.AddDelegate(type, ret);
            return ret;
        }

        internal Delegate Create(Type delegateType, IntPtr nativeJsFuncPtr)
        {
            Func<Type, IntPtr, Delegate> genericDelegateCreator;

            if (!genericDelegateCreatorCache.TryGetValue(delegateType,
                out genericDelegateCreator)) {
                //如果泛型方法数组未初始化
                if (genericAction == null) {
                    PreventStripping(null);
                    var methods = typeof(GenericDelegate).GetMethods(BindingFlags.Instance
                        | BindingFlags.Public
                        | BindingFlags.DeclaredOnly);
                    genericAction = methods.Where(m => m.Name == "Action")
                            .OrderBy(m => m.GetParameters().Length)
                            .ToArray();
                    genericFunc = methods.Where(m => m.Name == "Func")
                            .OrderBy(m => m.GetParameters().Length)
                            .ToArray();
                }
                var delegateMethod = delegateType.GetMethod("Invoke");
                var parameters = delegateMethod.GetParameters();
                var typeArgs = parameters.Select(pinfo => pinfo.ParameterType).ToArray();

                if (delegateMethod.ReturnType == typeof(void)) {
                    if (parameters.Length == 0) {
                        //对无参无返回值特殊处理
                        var methodInfo = genericAction[0];
                        genericDelegateCreator = (dt, ptr) => CreateDelegate(
                            dt, ToGenericDelegate(ptr), methodInfo);
                    }
                    else {
                        genericDelegateCreator = ActionCreatorTree.Find(typeArgs);
                    }
                }
                else {
                    //如果是有返回值，需要加上返回值作为泛型实参
                    typeArgs = typeArgs.Concat(new[] { delegateMethod.ReturnType }).ToArray();
                    genericDelegateCreator = FuncCreatorTree.Find(typeArgs);
                }

                if (genericDelegateCreator == null) {
#if UNITY_EDITOR && !EXPERIMENTAL_IL2CPP_PUERTS
                    if ((delegateMethod.ReturnType.IsValueType
                            && delegateMethod.ReturnType != typeof(void))
                        || parameters.Length > 4
                        || typeArgs.Any(paramType => paramType.IsValueType || paramType.IsByRef)) {
                        // 如果不在支持的范围，则生成一个永远返回空的构造器
                        genericDelegateCreator = (dt, x) => null;
                    }
                    else
#endif
                    {
                        //根据参数个数，返回值找到泛型实现
                        MethodInfo genericMethodInfo = null;
                        if (delegateMethod.ReturnType == typeof(void))
                            genericMethodInfo = genericAction[parameters.Length];
                        else
                            genericMethodInfo = genericFunc[parameters.Length];
                        //实例化泛型方法
                        var methodInfo = genericMethodInfo.MakeGenericMethod(typeArgs);
                        //构造器
                        genericDelegateCreator = (dt, ptr) => CreateDelegate(
                            dt, ToGenericDelegate(ptr), methodInfo);
                    }
                }
                //缓存构造器，下次调用直接返回
                genericDelegateCreatorCache[delegateType] = genericDelegateCreator;
            }
            //创建delegate
            return genericDelegateCreator(delegateType, nativeJsFuncPtr);
        }

        public void RegisterAction<T1>()
        {
            ActionCreatorTree.Add((type, ptr) => {
                var genericDelegate = ToGenericDelegate(ptr);
                return CreateDelegate(type, genericDelegate,
                    new Action<T1>(genericDelegate.Action).Method);
            }, typeof(T1));
        }

        public void RegisterAction<T1, T2>()
        {
            ActionCreatorTree.Add((type, ptr) => {
                var genericDelegate = ToGenericDelegate(ptr);
                return CreateDelegate(type, genericDelegate,
                    new Action<T1, T2>(genericDelegate.Action).Method);
            }, typeof(T1), typeof(T2));
        }

        public void RegisterAction<T1, T2, T3>()
        {
            ActionCreatorTree.Add((type, ptr) => {
                var genericDelegate = ToGenericDelegate(ptr);
                return CreateDelegate(type, genericDelegate,
                    new Action<T1, T2, T3>(genericDelegate.Action).Method);
            }, typeof(T1), typeof(T2), typeof(T3));
        }

        public void RegisterAction<T1, T2, T3, T4>()
        {
            ActionCreatorTree.Add((type, ptr) => {
                var genericDelegate = ToGenericDelegate(ptr);
                return CreateDelegate(type, genericDelegate,
                    new Action<T1, T2, T3, T4>(genericDelegate.Action).Method);
            }, typeof(T1), typeof(T2), typeof(T3), typeof(T4));
        }

        public void RegisterFunc<TResult>()
        {
            FuncCreatorTree.Add((type, ptr) => {
                var genericDelegate = ToGenericDelegate(ptr);
                return CreateDelegate(type, genericDelegate,
                    new Func<TResult>(genericDelegate.Func<TResult>).Method);
            }, typeof(TResult));
        }

        public void RegisterFunc<T1, TResult>()
        {
            FuncCreatorTree.Add((type, ptr) => {
                var genericDelegate = ToGenericDelegate(ptr);
                return CreateDelegate(type, genericDelegate,
                    new Func<T1, TResult>(genericDelegate.Func<T1, TResult>).Method);
            }, typeof(T1), typeof(TResult));
        }

        public void RegisterFunc<T1, T2, TResult>()
        {
            FuncCreatorTree.Add((type, ptr) => {
                var genericDelegate = ToGenericDelegate(ptr);
                return CreateDelegate(type, genericDelegate,
                    new Func<T1, T2, TResult>(genericDelegate.Func<T1, T2, TResult>).Method);
            }, typeof(T1), typeof(T2), typeof(TResult));
        }

        public void RegisterFunc<T1, T2, T3, TResult>()
        {
            FuncCreatorTree.Add((type, ptr) => {
                var genericDelegate = ToGenericDelegate(ptr);
                return CreateDelegate(type, genericDelegate,
                    new Func<T1, T2, T3, TResult>(genericDelegate.Func<T1, T2, T3, TResult>)
                            .Method);
            }, typeof(T1), typeof(T2), typeof(T3), typeof(TResult));
        }

        public void RegisterFunc<T1, T2, T3, T4, TResult>()
        {
            FuncCreatorTree.Add((type, ptr) => {
                var genericDelegate = ToGenericDelegate(ptr);
                return CreateDelegate(type, genericDelegate,
                    new Func<T1, T2, T3, T4, TResult>(genericDelegate.Func<T1, T2, T3, T4, TResult>)
                            .Method);
            }, typeof(T1), typeof(T2), typeof(T3), typeof(T4), typeof(TResult));
        }
    }

    //泛型适配器
    public class GenericDelegate
    {
        private Dictionary<Type, Delegate> bindTo;
        private Type firstKey;
        private Delegate firstValue;
        private IntPtr isolate;
        private JsEnv jsEnv;
        private IntPtr nativeJsFuncPtr;

        internal GenericDelegate(IntPtr nativeJsFuncPtr, JsEnv jsEnv)
        {
            this.nativeJsFuncPtr = nativeJsFuncPtr;
            jsEnv.IncFuncRef(nativeJsFuncPtr);
            isolate = jsEnv != null ? jsEnv.isolate : IntPtr.Zero;
            this.jsEnv = jsEnv;
        }

        internal IntPtr getJsFuncPtr() => nativeJsFuncPtr;

        internal void Close()
        {
            nativeJsFuncPtr = IntPtr.Zero;
            // it should set to null, otherwise it will prevent JsEnv to be GC.
            jsEnv = null;
        }

        private void CheckLiveness(bool shouldThrow = true)
        {
            if (nativeJsFuncPtr == IntPtr.Zero) {
                if (shouldThrow) throw new Exception("JsEnv has been disposed");
            }
            else {
                jsEnv.CheckLiveness();
            }
        }

        ~GenericDelegate()
        {
            CheckLiveness(false);
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            jsEnv.DecFuncRef(nativeJsFuncPtr);
#if THREAD_SAFE
            }
#endif
        }

        public bool TryGetDelegate(Type key, out Delegate value)
        {
            if (key == firstKey) {
                value = firstValue;
                return true;
            }
            if (bindTo != null) return bindTo.TryGetValue(key, out value);
            value = null;
            return false;
        }

        public void AddDelegate(Type key, Delegate value)
        {
            if (key == firstKey)
                throw new ArgumentException(
                    "An element with the same key already exists in the dictionary.");

            if (firstKey == null && bindTo == null) // nothing 
            {
                firstKey = key;
                firstValue = value;
            }
            else if (firstKey != null && bindTo == null) // one key existed
            {
                bindTo = new Dictionary<Type, Delegate>();
                bindTo.Add(firstKey, firstValue);
                firstKey = null;
                firstValue = null;
                bindTo.Add(key, value);
            }
            else {
                bindTo.Add(key, value);
            }
        }

        public void Action()
        {
            // todo: jsEnv 被销毁后, 从C#调用js会导致为空, 实际上直接返回即可 
            if (nativeJsFuncPtr == IntPtr.Zero) return;
            CheckLiveness();
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            var resultInfo = PuertsDLL.InvokeJSFunction(nativeJsFuncPtr, false);

            if (resultInfo == IntPtr.Zero) {
                var exceptionInfo = PuertsDLL.GetFunctionLastExceptionInfo(nativeJsFuncPtr);
                throw new Exception(exceptionInfo);
            }
#if THREAD_SAFE
            }
#endif
        }

        public void Action<T1>(T1 p1)
        {
            // todo: jsEnv 被销毁后, 从C#调用js会导致为空, 实际上直接返回即可 
            if (nativeJsFuncPtr == IntPtr.Zero) return;
            CheckLiveness();
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            StaticTranslate<T1>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p1);
            var resultInfo = PuertsDLL.InvokeJSFunction(nativeJsFuncPtr, false);

            if (resultInfo == IntPtr.Zero) {
                var exceptionInfo = PuertsDLL.GetFunctionLastExceptionInfo(nativeJsFuncPtr);
                throw new Exception(exceptionInfo);
            }
#if THREAD_SAFE
            }
#endif
        }

        public void Action<T1, T2>(T1 p1, T2 p2)
        {
            // todo: jsEnv 被销毁后, 从C#调用js会导致为空, 实际上直接返回即可 
            if (nativeJsFuncPtr == IntPtr.Zero) return;
            CheckLiveness();
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            StaticTranslate<T1>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p1);
            StaticTranslate<T2>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p2);
            var resultInfo = PuertsDLL.InvokeJSFunction(nativeJsFuncPtr, false);

            if (resultInfo == IntPtr.Zero) {
                var exceptionInfo = PuertsDLL.GetFunctionLastExceptionInfo(nativeJsFuncPtr);
                throw new Exception(exceptionInfo);
            }
#if THREAD_SAFE
            }
#endif
        }

        public void Action<T1, T2, T3>(T1 p1, T2 p2, T3 p3)
        {
            // todo: jsEnv 被销毁后, 从C#调用js会导致为空, 实际上直接返回即可 
            if (nativeJsFuncPtr == IntPtr.Zero) return;
            CheckLiveness();
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            StaticTranslate<T1>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p1);
            StaticTranslate<T2>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p2);
            StaticTranslate<T3>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p3);
            var resultInfo = PuertsDLL.InvokeJSFunction(nativeJsFuncPtr, false);

            if (resultInfo == IntPtr.Zero) {
                var exceptionInfo = PuertsDLL.GetFunctionLastExceptionInfo(nativeJsFuncPtr);
                throw new Exception(exceptionInfo);
            }
#if THREAD_SAFE
            }
#endif
        }

        public void Action<T1, T2, T3, T4>(T1 p1, T2 p2, T3 p3, T4 p4)
        {
            // todo: jsEnv 被销毁后, 从C#调用js会导致为空, 实际上直接返回即可 
            if (nativeJsFuncPtr == IntPtr.Zero) return;
            CheckLiveness();
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            StaticTranslate<T1>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p1);
            StaticTranslate<T2>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p2);
            StaticTranslate<T3>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p3);
            StaticTranslate<T4>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p4);
            var resultInfo = PuertsDLL.InvokeJSFunction(nativeJsFuncPtr, false);

            if (resultInfo == IntPtr.Zero) {
                var exceptionInfo = PuertsDLL.GetFunctionLastExceptionInfo(nativeJsFuncPtr);
                throw new Exception(exceptionInfo);
            }
#if THREAD_SAFE
            }
#endif
        }

        public TResult Func<TResult>()
        {
            // todo: jsEnv 被销毁后, 从C#调用js会导致为空, 实际上直接返回即可 
            if (nativeJsFuncPtr == IntPtr.Zero) return default;
            CheckLiveness();
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            var resultInfo = PuertsDLL.InvokeJSFunction(nativeJsFuncPtr, true);

            if (resultInfo == IntPtr.Zero) {
                var exceptionInfo = PuertsDLL.GetFunctionLastExceptionInfo(nativeJsFuncPtr);
                throw new Exception(exceptionInfo);
            }
            var result = StaticTranslate<TResult>.Get(jsEnv.Idx, isolate,
                NativeValueApi.GetValueFromResult, resultInfo, false);
            PuertsDLL.ResetResult(resultInfo);
            return result;
#if THREAD_SAFE
            }
#endif
        }

        public TResult Func<T1, TResult>(T1 p1)
        {
            // todo: jsEnv 被销毁后, 从C#调用js会导致为空, 实际上直接返回即可 
            if (nativeJsFuncPtr == IntPtr.Zero) return default;
            CheckLiveness();
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            StaticTranslate<T1>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p1);
            var resultInfo = PuertsDLL.InvokeJSFunction(nativeJsFuncPtr, true);

            if (resultInfo == IntPtr.Zero) {
                var exceptionInfo = PuertsDLL.GetFunctionLastExceptionInfo(nativeJsFuncPtr);
                throw new Exception(exceptionInfo);
            }
            var result = StaticTranslate<TResult>.Get(jsEnv.Idx, isolate,
                NativeValueApi.GetValueFromResult, resultInfo, false);
            PuertsDLL.ResetResult(resultInfo);
            return result;
#if THREAD_SAFE
            }
#endif
        }

        public TResult Func<T1, T2, TResult>(T1 p1, T2 p2)
        {
            // todo: jsEnv 被销毁后, 从C#调用js会导致为空, 实际上直接返回即可 
            if (nativeJsFuncPtr == IntPtr.Zero) return default;
            CheckLiveness();
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            StaticTranslate<T1>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p1);
            StaticTranslate<T2>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p2);
            var resultInfo = PuertsDLL.InvokeJSFunction(nativeJsFuncPtr, true);

            if (resultInfo == IntPtr.Zero) {
                var exceptionInfo = PuertsDLL.GetFunctionLastExceptionInfo(nativeJsFuncPtr);
                throw new Exception(exceptionInfo);
            }
            var result = StaticTranslate<TResult>.Get(jsEnv.Idx, isolate,
                NativeValueApi.GetValueFromResult, resultInfo, false);
            PuertsDLL.ResetResult(resultInfo);
            return result;
#if THREAD_SAFE
            }
#endif
        }

        public TResult Func<T1, T2, T3, TResult>(T1 p1, T2 p2, T3 p3)
        {
            // todo: jsEnv 被销毁后, 从C#调用js会导致为空, 实际上直接返回即可 
            if (nativeJsFuncPtr == IntPtr.Zero) return default;
            CheckLiveness();
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            StaticTranslate<T1>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p1);
            StaticTranslate<T2>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p2);
            StaticTranslate<T3>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p3);
            var resultInfo = PuertsDLL.InvokeJSFunction(nativeJsFuncPtr, true);

            if (resultInfo == IntPtr.Zero) {
                var exceptionInfo = PuertsDLL.GetFunctionLastExceptionInfo(nativeJsFuncPtr);
                throw new Exception(exceptionInfo);
            }
            var result = StaticTranslate<TResult>.Get(jsEnv.Idx, isolate,
                NativeValueApi.GetValueFromResult, resultInfo, false);
            PuertsDLL.ResetResult(resultInfo);
            return result;
#if THREAD_SAFE
            }
#endif
        }

        public TResult Func<T1, T2, T3, T4, TResult>(T1 p1, T2 p2, T3 p3, T4 p4)
        {
            // todo: jsEnv 被销毁后, 从C#调用js会导致为空, 实际上直接返回即可 
            if (nativeJsFuncPtr == IntPtr.Zero) return default;
            CheckLiveness();
#if THREAD_SAFE
            lock (jsEnv) {
#endif
            StaticTranslate<T1>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p1);
            StaticTranslate<T2>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p2);
            StaticTranslate<T3>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p3);
            StaticTranslate<T4>.Set(jsEnv.Idx, isolate, NativeValueApi.SetValueToArgument,
                nativeJsFuncPtr, p4);
            var resultInfo = PuertsDLL.InvokeJSFunction(nativeJsFuncPtr, true);

            if (resultInfo == IntPtr.Zero) {
                var exceptionInfo = PuertsDLL.GetFunctionLastExceptionInfo(nativeJsFuncPtr);
                throw new Exception(exceptionInfo);
            }
            var result = StaticTranslate<TResult>.Get(jsEnv.Idx, isolate,
                NativeValueApi.GetValueFromResult, resultInfo, false);
            PuertsDLL.ResetResult(resultInfo);
            return result;
#if THREAD_SAFE
            }
#endif
        }
    }
}

#endif
