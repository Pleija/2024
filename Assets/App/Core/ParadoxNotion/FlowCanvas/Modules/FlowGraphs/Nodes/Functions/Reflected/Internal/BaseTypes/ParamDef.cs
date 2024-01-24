#region
using System;
using System.Reflection;
#endregion

namespace FlowCanvas.Nodes
{
    public struct ParamDef
    {
        public Type paramType;
        public Type arrayType;
        public ParamMode paramMode;
        public string portName;
        public string portId;
        public bool isParamsArray;
        public MemberInfo presentedInfo;
    }
}
