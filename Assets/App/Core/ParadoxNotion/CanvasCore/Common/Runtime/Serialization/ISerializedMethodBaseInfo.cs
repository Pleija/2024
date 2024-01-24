#region
using System.Reflection;
#endregion

namespace ParadoxNotion.Serialization
{
    public interface ISerializedMethodBaseInfo : ISerializedReflectedInfo
    {
        MethodBase GetMethodBase();
        bool HasChanged();
    }
}
