using UnityEngine;

namespace Runtime.Contracts
{
    public interface ISingleScriptable
    {
        void SetInstance(ScriptableObject target);
    }
}
