using System;
using System.Linq;
using System.Reflection;
using ParadoxNotion;
using ParadoxNotion.Serialization;
using UnityEngine;

namespace NodeCanvas.Framework.Internal
{
    /// <summary>
    ///     Wraps a MethodInfo with the relevant BBParameters to be called within a Reflection based
    ///     Task
    /// </summary>
    public abstract class ReflectedWrapper : IReflectedWrapper
    {
        //required
        public ReflectedWrapper() { }

        [SerializeField]
        protected SerializedMethodInfo _targetMethod;

        public static ReflectedWrapper Create(MethodInfo method, IBlackboard bb)
        {
            if (method == null) return null;
            if (method.ReturnType == typeof(void)) return ReflectedActionWrapper.Create(method, bb);
            return ReflectedFunctionWrapper.Create(method, bb);
        }

        ISerializedReflectedInfo IReflectedWrapper.GetSerializedInfo() => _targetMethod;

        public void SetVariablesBB(IBlackboard bb)
        {
            foreach (var bbVar in GetVariables()) bbVar.bb = bb;
        }

        public SerializedMethodInfo GetSerializedMethod() => _targetMethod;
        public MethodInfo GetMethod() => _targetMethod;
        public bool HasChanged() => _targetMethod != null ? _targetMethod.HasChanged() : false;
        public string AsString() => _targetMethod != null ? _targetMethod.AsString() : null;
        public override string ToString() => AsString();
        public abstract BBParameter[] GetVariables();
        public abstract void Init(object instance);
    }

    /// <summary>
    ///     Wraps a MethodInfo Action with the relevant BBVariables to be commonly called within a
    ///     Reflection based Task
    /// </summary>
    public abstract class ReflectedActionWrapper : ReflectedWrapper
    {
        public new static ReflectedActionWrapper Create(MethodInfo method, IBlackboard bb)
        {
            if (method == null) return null;
            Type type = null;
            var parameters = method.GetParameters();
            if (parameters.Length == 0) type = typeof(ReflectedAction);
            if (parameters.Length == 1) type = typeof(ReflectedAction<>);
            if (parameters.Length == 2) type = typeof(ReflectedAction<,>);
            if (parameters.Length == 3) type = typeof(ReflectedAction<,,>);
            if (parameters.Length == 4) type = typeof(ReflectedAction<,,,>);
            if (parameters.Length == 5) type = typeof(ReflectedAction<,,,,>);
            if (parameters.Length == 6) type = typeof(ReflectedAction<,,,,,>);
            var argTypes = new Type[parameters.Length];

            for (var i = 0; i < parameters.Length; i++) {
                var parameter = parameters[i];
                var pType = parameter.ParameterType.IsByRef
                    ? parameter.ParameterType.GetElementType() : parameter.ParameterType;
                argTypes[i] = pType;
            }
            var o = (ReflectedActionWrapper)Activator.CreateInstance(argTypes.Length > 0
                ? type.RTMakeGenericType(argTypes) : type);
            o._targetMethod = new SerializedMethodInfo(method);
            BBParameter.SetBBFields(o, bb);
            var bbParams = o.GetVariables();

            for (var i = 0; i < parameters.Length; i++) {
                var p = parameters[i];
                if (p.IsOptional) bbParams[i].value = p.DefaultValue;
            }
            return o;
        }

        public abstract void Call();
    }

    /// <summary>
    ///     Wraps a MethodInfo Function with the relevant BBVariables to be commonly called within a
    ///     Reflection based Task
    /// </summary>
    public abstract class ReflectedFunctionWrapper : ReflectedWrapper
    {
        public new static ReflectedFunctionWrapper Create(MethodInfo method, IBlackboard bb)
        {
            if (method == null) return null;
            Type type = null;
            var parameters = method.GetParameters();
            if (parameters.Length == 0) type = typeof(ReflectedFunction<>);
            if (parameters.Length == 1) type = typeof(ReflectedFunction<,>);
            if (parameters.Length == 2) type = typeof(ReflectedFunction<,,>);
            if (parameters.Length == 3) type = typeof(ReflectedFunction<,,,>);
            if (parameters.Length == 4) type = typeof(ReflectedFunction<,,,,>);
            if (parameters.Length == 5) type = typeof(ReflectedFunction<,,,,,>);
            if (parameters.Length == 6) type = typeof(ReflectedFunction<,,,,,,>);
            var argTypes = new Type[parameters.Length + 1];
            argTypes[0] = method.ReturnType;

            for (var i = 0; i < parameters.Length; i++) {
                var parameter = parameters[i];
                var pType = parameter.ParameterType.IsByRef
                    ? parameter.ParameterType.GetElementType() : parameter.ParameterType;
                argTypes[i + 1] = pType;
            }
            var o = (ReflectedFunctionWrapper)Activator.CreateInstance(
                type.RTMakeGenericType(argTypes.ToArray()));
            o._targetMethod = new SerializedMethodInfo(method);
            BBParameter.SetBBFields(o, bb);
            var bbParams = o.GetVariables();

            for (var i = 0; i < parameters.Length; i++) {
                var p = parameters[i];
                if (p.IsOptional) bbParams[i + 1].value = p.DefaultValue; //index 0 is return value
            }
            return o;
        }

        public abstract object Call();
    }
}
