#region
using System;
using System.Collections.Generic;
using UnityEngine;
using Object = UnityEngine.Object;
#endregion

namespace NodeCanvas.Framework
{
    ///<summary> An interface for Blackboards</summary>
    public interface IBlackboard
    {
        string identifier { get; }
        IBlackboard parent { get; }
        Dictionary<string, Variable> variables { get; set; }
        Component propertiesBindTarget { get; }
        Object unityContextObject { get; }
        string independantVariablesFieldName { get; }
        event Action<Variable> onVariableAdded;
        event Action<Variable> onVariableRemoved;
        void TryInvokeOnVariableAdded(Variable variable);
        void TryInvokeOnVariableRemoved(Variable variable);
    }

    ///<summary> An interface for Global Blackboards</summary>
    public interface IGlobalBlackboard : IBlackboard
    {
        string UID { get; }
    }
}
