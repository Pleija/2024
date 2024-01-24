#region
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Movement/Direct"),
     Description("Moves the agent away from target per frame without pathfinding")]
    public class MoveAway : ActionTask<Transform>
    {
        public BBParameter<float> speed = 2;
        public BBParameter<float> stopDistance = 3;

        [RequiredField]
        public BBParameter<GameObject> target;

        public bool waitActionFinish;

        protected override void OnUpdate()
        {
            if ((agent.position - target.value.transform.position).magnitude
                >= stopDistance.value) {
                EndAction();
                return;
            }
            agent.position = Vector3.MoveTowards(agent.position, target.value.transform.position,
                -speed.value * Time.deltaTime);
            if (!waitActionFinish) EndAction();
        }
    }
}
