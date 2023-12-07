using System;
using Api;

namespace Hubs
{
    [AttributeUsage(AttributeTargets.Method)]
    public class RpcAttribute : Attribute
    {
        public ApiFunc type;

        public RpcAttribute(object target)
        {
            type = (ApiFunc)target;
        }
    }
}
