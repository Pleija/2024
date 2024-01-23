using System;
using System.Collections.Generic;
using System.Linq;
using ParadoxNotion;

namespace FlowCanvas.Nodes
{
    /// <summary>
    ///     Extractor Nodes have one value input and up to 5 'out' value parameters. They don't need
    ///     Flow execution.
    /// </summary>
    public abstract class ExtractorNode : SimplexNode
    {
        //K: type to extract
        //V: extractor node type
        private static Dictionary<Type, Type> _extractors;

        public static Type GetExtractorType(Type type)
        {
            if (_extractors == null) {
                _extractors = new Dictionary<Type, Type>();
                var extractorTypes = ReflectionTools.GetImplementationsOf(typeof(ExtractorNode))
                    .Where(t => !t.IsGenericTypeDefinition);

                foreach (var extractorType in extractorTypes) {
                    var invokeMethod = extractorType.RTGetMethod("Invoke");
                    var targetType = invokeMethod.GetParameters()[0].ParameterType;
                    _extractors[targetType] = extractorType;
                }
            }
            Type result = null;
            _extractors.TryGetValue(type, out result);
            return result;
        }
    }

    public abstract class ExtractorNode<TInstance, T1, T2> : ExtractorNode
    {
        private T1 a;
        private T2 b;
        public abstract void Invoke(TInstance instance, out T1 a, out T2 b);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var i = node.AddValueInput<TInstance>(typeof(TInstance).FriendlyName());
            node.AddValueOutput<T1>(parameters[1].Name, () => {
                Invoke(i.value, out a, out b);
                return a;
            });
            node.AddValueOutput<T2>(parameters[2].Name, () => {
                Invoke(i.value, out a, out b);
                return b;
            });
        }
    }

    public abstract class ExtractorNode<TInstance, T1, T2, T3> : ExtractorNode
    {
        private T1 a;
        private T2 b;
        private T3 c;
        public abstract void Invoke(TInstance instance, out T1 a, out T2 b, out T3 c);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var i = node.AddValueInput<TInstance>(typeof(TInstance).FriendlyName());
            node.AddValueOutput<T1>(parameters[1].Name, () => {
                Invoke(i.value, out a, out b, out c);
                return a;
            });
            node.AddValueOutput<T2>(parameters[2].Name, () => {
                Invoke(i.value, out a, out b, out c);
                return b;
            });
            node.AddValueOutput<T3>(parameters[3].Name, () => {
                Invoke(i.value, out a, out b, out c);
                return c;
            });
        }
    }

    public abstract class ExtractorNode<TInstance, T1, T2, T3, T4> : ExtractorNode
    {
        private T1 a;
        private T2 b;
        private T3 c;
        private T4 d;
        public abstract void Invoke(TInstance instance, out T1 a, out T2 b, out T3 c, out T4 d);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var i = node.AddValueInput<TInstance>(typeof(TInstance).FriendlyName());
            node.AddValueOutput<T1>(parameters[1].Name, () => {
                Invoke(i.value, out a, out b, out c, out d);
                return a;
            });
            node.AddValueOutput<T2>(parameters[2].Name, () => {
                Invoke(i.value, out a, out b, out c, out d);
                return b;
            });
            node.AddValueOutput<T3>(parameters[3].Name, () => {
                Invoke(i.value, out a, out b, out c, out d);
                return c;
            });
            node.AddValueOutput<T4>(parameters[4].Name, () => {
                Invoke(i.value, out a, out b, out c, out d);
                return d;
            });
        }
    }

    public abstract class ExtractorNode<TInstance, T1, T2, T3, T4, T5> : ExtractorNode
    {
        private T1 a;
        private T2 b;
        private T3 c;
        private T4 d;
        private T5 e;

        public abstract void Invoke(TInstance instance, out T1 a, out T2 b, out T3 c, out T4 d,
            out T5 e);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var i = node.AddValueInput<TInstance>(typeof(TInstance).FriendlyName());
            node.AddValueOutput<T1>(parameters[1].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e);
                return a;
            });
            node.AddValueOutput<T2>(parameters[2].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e);
                return b;
            });
            node.AddValueOutput<T3>(parameters[3].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e);
                return c;
            });
            node.AddValueOutput<T4>(parameters[4].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e);
                return d;
            });
            node.AddValueOutput<T5>(parameters[5].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e);
                return e;
            });
        }
    }

    public abstract class ExtractorNode<TInstance, T1, T2, T3, T4, T5, T6> : ExtractorNode
    {
        private T1 a;
        private T2 b;
        private T3 c;
        private T4 d;
        private T5 e;
        private T6 f;

        public abstract void Invoke(TInstance instance, out T1 a, out T2 b, out T3 c, out T4 d,
            out T5 e, out T6 f);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var i = node.AddValueInput<TInstance>(typeof(TInstance).FriendlyName());
            node.AddValueOutput<T1>(parameters[1].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e, out f);
                return a;
            });
            node.AddValueOutput<T2>(parameters[2].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e, out f);
                return b;
            });
            node.AddValueOutput<T3>(parameters[3].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e, out f);
                return c;
            });
            node.AddValueOutput<T4>(parameters[4].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e, out f);
                return d;
            });
            node.AddValueOutput<T5>(parameters[5].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e, out f);
                return e;
            });
            node.AddValueOutput<T6>(parameters[6].Name, () => {
                Invoke(i.value, out a, out b, out c, out d, out e, out f);
                return f;
            });
        }
    }
}
