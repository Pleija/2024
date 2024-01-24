#region
using System;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Obsolete("Use Get Property instead"), Category("GameObject")]
    public class GetGameObjectPosition : ActionTask<Transform>
    {
        [BlackboardOnly]
        public BBParameter<Vector3> saveAs;

        protected override string info => "Get " + agentInfo + " position as " + saveAs;

        protected override void OnExecute()
        {
            saveAs.value = agent.position;
            EndAction();
        }
    }
}
