#region
using System.Collections.Generic;

#if UNITY_EDITOR
using NodeCanvas.Editor;
#endif
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
using Logger = ParadoxNotion.Services.Logger;
#endregion

namespace NodeCanvas.DialogueTrees
{
    [Icon("Selector"), Name("Multiple Task Condition"), Category("Branch"),
     Description(
         "Will continue with the first child node which condition returns true. The Dialogue Actor selected will be used for the checks"),
     Color("b3ff7f")]
    public class MultipleConditionNode : DTNode
    {
        [SerializeField, AutoSortWithChildrenConnections]
        private List<ConditionTask> conditions = new List<ConditionTask>();

        public override int maxOutConnections => -1;

        public override void OnChildConnected(int index)
        {
            if (conditions.Count < outConnections.Count) conditions.Insert(index, null);
        }

        public override void OnChildDisconnected(int index)
        {
            conditions.RemoveAt(index);
        }

        protected override Status OnExecute(Component agent, IBlackboard bb)
        {
            if (outConnections.Count == 0)
                return Error("There are no connections on the Dialogue Condition Node");

            for (var i = 0; i < outConnections.Count; i++)
                if (conditions[i] == null
                    || conditions[i].CheckOnce(finalActor.transform, graphBlackboard)) {
                    DLGTree.Continue(i);
                    return Status.Success;
                }
            Logger.LogWarning("No condition is true. Dialogue Ends.", LogTag.EXECUTION, this);
            DLGTree.Stop(false);
            return Status.Failure;
        }

        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        public override void OnConnectionInspectorGUI(int i)
        {
            TaskEditor.TaskFieldMulti(conditions[i], DLGTree, c => {
                conditions[i] = c;
            });
        }

        public override string GetConnectionInfo(int i) =>
                conditions[i] != null ? conditions[i].summaryInfo : "TRUE";
#endif
    }
}
