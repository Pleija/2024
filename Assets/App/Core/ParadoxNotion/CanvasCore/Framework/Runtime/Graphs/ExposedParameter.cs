#region
using System;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Framework
{
    /// <summary>
    ///     Used to parametrize root graph local blackboard parameters from GraphOwner, without affecting
    ///     the graph
    ///     variables serialization. So each GraphOwner can parametrize the assigned graph individually,
    ///     while the graph
    ///     remains the same serialization-wise. Relevant when either using Prefab GraphOwners with Bound
    ///     Graphs, or re-using
    ///     Asset Graphs on GraphOwners.
    /// </summary>
    [SpoofAOT]
    public abstract class ExposedParameter
    {
        public abstract string targetVariableID { get; }
        public abstract Type type { get; }
        public abstract object valueBoxed { get; set; }
        public abstract Variable varRefBoxed { get; }
        public abstract void Bind(IBlackboard blackboard);
        public abstract void UnBind();

        public static ExposedParameter CreateInstance(Variable target) =>
                (ExposedParameter)Activator.CreateInstance(
                    typeof(ExposedParameter<>).MakeGenericType(target.varType),
                    ReflectionTools.SingleTempArgsArray(target));
    }

    ///<summary>See ExposedParameter</summary>
    public sealed class ExposedParameter<T> : ExposedParameter
    {
        [SerializeField]
        private string _targetVariableID;

        [SerializeField]
        private T _value;

        public ExposedParameter() { }

        public ExposedParameter(Variable target)
        {
            Debug.Assert(target is Variable<T>, "Target Variable is not typeof T");
            _targetVariableID = target.ID;
            _value = (T)target.value;
        }

        public Variable<T> varRef { get; private set; }
        public override string targetVariableID => _targetVariableID;
        public override Type type => typeof(T);

        public override object valueBoxed {
            get => value;
            set => this.value = (T)value;
        }

        public override Variable varRefBoxed => varRef;

        ///<summary>Value of the parameter</summary>
        public T value {
            get => varRef != null && Application.isPlaying ? varRef.value : _value;
            set {
                if (varRef != null && Application.isPlaying) varRef.value = value;
                _value = value;
            }
        }

        ///<summary>Initialize Variables binding from target blackboard</summary>
        public override void Bind(IBlackboard blackboard)
        {
            if (varRef != null) varRef.UnBind(); //unbind if any
            varRef = (Variable<T>)blackboard.GetVariableByID(targetVariableID);
            if (varRef != null) varRef.BindGetSet(GetRawValue, SetRawValue);
        }

        ///<summary>Unbind from variable if any</summary>
        public override void UnBind()
        {
            if (varRef != null) varRef.UnBind();
        }

        private T GetRawValue() => _value;

        private void SetRawValue(T value)
        {
            _value = value;
        }
    }
}
