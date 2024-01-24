#region
using System;
using NodeCanvas.Framework;
using NodeCanvas.Framework.Internal;
using ParadoxNotion.Design;
#endregion

[Category("✫ Blackboard")]
public class SetEnumFlag : ActionTask
{
    public readonly BBParameter<bool> Clear = new BBParameter<bool>();
    public readonly BBObjectParameter Flag = new BBObjectParameter(typeof(Enum));

    [BlackboardOnly, RequiredField]
    public readonly BBObjectParameter Variable = new BBObjectParameter(typeof(Enum));

    protected override string info =>
            $"{(Clear.value ? "Clear" : "Set")} {Variable} for {Flag} flag";

    protected override void OnExecute()
    {
        var Value = (int)Variable.value;
        if (Clear.value)
            Value &= ~(int)Flag.value;
        else
            Value |= (int)Flag.value;
        Variable.value = Enum.ToObject(Variable.varRef.varType, Value);
        EndAction();
    }

#if UNITY_EDITOR

    protected override void OnTaskInspectorGUI()
    {
        DrawDefaultInspector();
        if (Flag.varType != Variable.refType) Flag.SetType(Variable.refType);
    }

#endif
}
