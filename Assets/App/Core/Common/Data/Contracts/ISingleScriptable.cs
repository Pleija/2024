using UnityEngine;

namespace Data
{
    public interface ISingleScriptable
    {
        void SetInstance(ScriptableObject target);
    }
}
