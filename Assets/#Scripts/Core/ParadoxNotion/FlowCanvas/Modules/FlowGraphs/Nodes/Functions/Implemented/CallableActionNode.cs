namespace FlowCanvas.Nodes
{
    ///<summary>Action Nodes do not return any value and can have up to 10 parameters. They need Flow execution.</summary>
    public abstract class CallableActionNodeBase : SimplexNode { }

    public abstract class CallableActionNode : CallableActionNodeBase
    {
        public abstract void Invoke();

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            node.AddFlowInput(" ", (Flow f) => {
                Invoke();
                o.Call(f);
            });
        }
    }

    public abstract class CallableActionNode<T1> : CallableActionNodeBase
    {
        public abstract void Invoke(T1 a);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            var p1 = node.AddValueInput<T1>(parameters[0].Name);
            node.AddFlowInput(" ", (Flow f) => {
                Invoke(p1.value);
                o.Call(f);
            });
        }
    }

    public abstract class CallableActionNode<T1, T2> : CallableActionNodeBase
    {
        public abstract void Invoke(T1 a, T2 b);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            var p1 = node.AddValueInput<T1>(parameters[0].Name);
            var p2 = node.AddValueInput<T2>(parameters[1].Name);
            node.AddFlowInput(" ", (Flow f) => {
                Invoke(p1.value, p2.value);
                o.Call(f);
            });
        }
    }

    public abstract class CallableActionNode<T1, T2, T3> : CallableActionNodeBase
    {
        public abstract void Invoke(T1 a, T2 b, T3 c);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            var p1 = node.AddValueInput<T1>(parameters[0].Name);
            var p2 = node.AddValueInput<T2>(parameters[1].Name);
            var p3 = node.AddValueInput<T3>(parameters[2].Name);
            node.AddFlowInput(" ", (Flow f) => {
                Invoke(p1.value, p2.value, p3.value);
                o.Call(f);
            });
        }
    }

    public abstract class CallableActionNode<T1, T2, T3, T4> : CallableActionNodeBase
    {
        public abstract void Invoke(T1 a, T2 b, T3 c, T4 d);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            var p1 = node.AddValueInput<T1>(parameters[0].Name);
            var p2 = node.AddValueInput<T2>(parameters[1].Name);
            var p3 = node.AddValueInput<T3>(parameters[2].Name);
            var p4 = node.AddValueInput<T4>(parameters[3].Name);
            node.AddFlowInput(" ", (Flow f) => {
                Invoke(p1.value, p2.value, p3.value, p4.value);
                o.Call(f);
            });
        }
    }

    public abstract class CallableActionNode<T1, T2, T3, T4, T5> : CallableActionNodeBase
    {
        public abstract void Invoke(T1 a, T2 b, T3 c, T4 d, T5 e);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            var p1 = node.AddValueInput<T1>(parameters[0].Name);
            var p2 = node.AddValueInput<T2>(parameters[1].Name);
            var p3 = node.AddValueInput<T3>(parameters[2].Name);
            var p4 = node.AddValueInput<T4>(parameters[3].Name);
            var p5 = node.AddValueInput<T5>(parameters[4].Name);
            node.AddFlowInput(" ", (Flow f) => {
                Invoke(p1.value, p2.value, p3.value, p4.value, p5.value);
                o.Call(f);
            });
        }
    }

    public abstract class CallableActionNode<T1, T2, T3, T4, T5, T6> : CallableActionNodeBase
    {
        public abstract void Invoke(T1 a, T2 b, T3 c, T4 d, T5 e, T6 f);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            var p1 = node.AddValueInput<T1>(parameters[0].Name);
            var p2 = node.AddValueInput<T2>(parameters[1].Name);
            var p3 = node.AddValueInput<T3>(parameters[2].Name);
            var p4 = node.AddValueInput<T4>(parameters[3].Name);
            var p5 = node.AddValueInput<T5>(parameters[4].Name);
            var p6 = node.AddValueInput<T6>(parameters[5].Name);
            node.AddFlowInput(" ", (Flow f) => {
                Invoke(p1.value, p2.value, p3.value, p4.value, p5.value, p6.value);
                o.Call(f);
            });
        }
    }

    public abstract class CallableActionNode<T1, T2, T3, T4, T5, T6, T7> : CallableActionNodeBase
    {
        public abstract void Invoke(T1 a, T2 b, T3 c, T4 d, T5 e, T6 f, T7 g);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            var p1 = node.AddValueInput<T1>(parameters[0].Name);
            var p2 = node.AddValueInput<T2>(parameters[1].Name);
            var p3 = node.AddValueInput<T3>(parameters[2].Name);
            var p4 = node.AddValueInput<T4>(parameters[3].Name);
            var p5 = node.AddValueInput<T5>(parameters[4].Name);
            var p6 = node.AddValueInput<T6>(parameters[5].Name);
            var p7 = node.AddValueInput<T7>(parameters[6].Name);
            node.AddFlowInput(" ", (Flow f) => {
                Invoke(p1.value, p2.value, p3.value, p4.value, p5.value, p6.value, p7.value);
                o.Call(f);
            });
        }
    }

    public abstract class CallableActionNode<T1, T2, T3, T4, T5, T6, T7, T8> : CallableActionNodeBase
    {
        public abstract void Invoke(T1 a, T2 b, T3 c, T4 d, T5 e, T6 f, T7 g, T8 h);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            var p1 = node.AddValueInput<T1>(parameters[0].Name);
            var p2 = node.AddValueInput<T2>(parameters[1].Name);
            var p3 = node.AddValueInput<T3>(parameters[2].Name);
            var p4 = node.AddValueInput<T4>(parameters[3].Name);
            var p5 = node.AddValueInput<T5>(parameters[4].Name);
            var p6 = node.AddValueInput<T6>(parameters[5].Name);
            var p7 = node.AddValueInput<T7>(parameters[6].Name);
            var p8 = node.AddValueInput<T8>(parameters[7].Name);
            node.AddFlowInput(" ", (Flow f) => {
                Invoke(p1.value, p2.value, p3.value, p4.value, p5.value, p6.value, p7.value, p8.value);
                o.Call(f);
            });
        }
    }

    public abstract class CallableActionNode<T1, T2, T3, T4, T5, T6, T7, T8, T9> : CallableActionNodeBase
    {
        public abstract void Invoke(T1 a, T2 b, T3 c, T4 d, T5 e, T6 f, T7 g, T8 h, T9 i);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            var p1 = node.AddValueInput<T1>(parameters[0].Name);
            var p2 = node.AddValueInput<T2>(parameters[1].Name);
            var p3 = node.AddValueInput<T3>(parameters[2].Name);
            var p4 = node.AddValueInput<T4>(parameters[3].Name);
            var p5 = node.AddValueInput<T5>(parameters[4].Name);
            var p6 = node.AddValueInput<T6>(parameters[5].Name);
            var p7 = node.AddValueInput<T7>(parameters[6].Name);
            var p8 = node.AddValueInput<T8>(parameters[7].Name);
            var p9 = node.AddValueInput<T9>(parameters[8].Name);
            node.AddFlowInput(" ", (Flow f) => {
                Invoke(p1.value, p2.value, p3.value, p4.value, p5.value, p6.value, p7.value, p8.value, p9.value);
                o.Call(f);
            });
        }
    }

    public abstract class CallableActionNode<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10> : CallableActionNodeBase
    {
        public abstract void Invoke(T1 a, T2 b, T3 c, T4 d, T5 e, T6 f, T7 g, T8 h, T9 i, T10 j);

        protected sealed override void OnRegisterPorts(FlowNode node)
        {
            var o = node.AddFlowOutput(" ");
            var p1 = node.AddValueInput<T1>(parameters[0].Name);
            var p2 = node.AddValueInput<T2>(parameters[1].Name);
            var p3 = node.AddValueInput<T3>(parameters[2].Name);
            var p4 = node.AddValueInput<T4>(parameters[3].Name);
            var p5 = node.AddValueInput<T5>(parameters[4].Name);
            var p6 = node.AddValueInput<T6>(parameters[5].Name);
            var p7 = node.AddValueInput<T7>(parameters[6].Name);
            var p8 = node.AddValueInput<T8>(parameters[7].Name);
            var p9 = node.AddValueInput<T9>(parameters[8].Name);
            var p10 = node.AddValueInput<T10>(parameters[9].Name);
            node.AddFlowInput(" ", (Flow f) => {
                Invoke(p1.value, p2.value, p3.value, p4.value, p5.value, p6.value, p7.value, p8.value, p9.value
                    , p10.value);
                o.Call(f);
            });
        }
    }
}
