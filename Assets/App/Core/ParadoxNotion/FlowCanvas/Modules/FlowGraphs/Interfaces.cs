#region
using UnityEditor;
using UnityEngine;
#endregion

namespace FlowCanvas
{
    /// <summary>
    ///     Implement this interface to get a callback when creating the editor menu. The OnMenu method
    ///     should be wrapped
    ///     in an #if UNITY_EDITOR
    /// </summary>
    public interface IEditorMenuCallbackReceiver
    {
#if UNITY_EDITOR
        void OnMenu(GenericMenu menu, Vector2 pos, Port sourcePort, object dropInstance);
#endif
    }
}
