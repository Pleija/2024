#region
using System;
using System.Reflection;
#endregion

namespace FlowCanvas.Nodes
{
    public abstract class BaseReflectedExtractorNode
    {
        protected ParametresDef Params { get; private set; }
        protected Type TargetType { get; private set; }

        protected static event Func<Type, bool, MemberInfo[], BaseReflectedExtractorNode>
                OnGetAotExtractorNode;

        public static BaseReflectedExtractorNode GetExtractorNode(Type targetType, bool isStatic,
            MemberInfo[] infos)
        {
            ParametresDef paramsDef;
            if (!ReflectedNodesHelper.InitParams(targetType, isStatic, infos, out paramsDef))
                return null;
#if !NET_STANDARD_2_0 && (UNITY_EDITOR || (!ENABLE_IL2CPP && (UNITY_STANDALONE || UNITY_ANDROID || UNITY_WSA)))
            var jit = new JitExtractorNode();
            if (jit.Init(paramsDef, targetType)) return jit;
#endif
            if (OnGetAotExtractorNode != null) {
                var eventAot = OnGetAotExtractorNode(targetType, isStatic, infos);
                if (eventAot != null && eventAot.Init(paramsDef, targetType)) return eventAot;
            }
            var aot = new PureReflectedExtractorNode();
            return aot.Init(paramsDef, targetType) ? aot : null;
        }

        protected bool Init(ParametresDef paramsDef, Type targetType)
        {
            Params = paramsDef;
            TargetType = targetType;
            return InitInternal();
        }

        protected abstract bool InitInternal();
        public abstract void RegisterPorts(FlowNode node);
    }
}
