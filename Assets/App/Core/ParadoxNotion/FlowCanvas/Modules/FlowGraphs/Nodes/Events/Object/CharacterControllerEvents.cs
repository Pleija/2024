#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Character Controller"), Category("Events/Object"),
     Description("Called when the Character Controller hits a collider while performing a Move")]
    public class CharacterControllerEvents : RouterEventNode<CharacterController>, IUpdatable
    {
        private ControllerColliderHit hitInfo;
        private FlowOutput onGrounded;
        private FlowOutput onHit;
        private FlowOutput onUnGrounded;
        private CharacterController receiver;
        private bool wasGrounded;
        private bool[] wasGroundedMulti;

        void IUpdatable.Update()
        {
            if (targetMode == TargetMode.SingleTarget) {
                var isGrounded = target.value.isGrounded;
                if (isGrounded && !wasGrounded) onGrounded.Call(Flow.New);
                if (!isGrounded && wasGrounded) onUnGrounded.Call(Flow.New);
                wasGrounded = isGrounded;
            }

            if (targetMode == TargetMode.MultipleTargets) {
                var list = targets.value;

                for (var i = 0; i < list.Count; i++) {
                    var t = list[i];
                    if (t == null) continue;
                    var isGrounded = t.isGrounded;

                    if (isGrounded && !wasGroundedMulti[i]) {
                        receiver = t;
                        onGrounded.Call(Flow.New);
                    }

                    if (!isGrounded && wasGroundedMulti[i]) {
                        receiver = t;
                        onUnGrounded.Call(Flow.New);
                    }
                    wasGroundedMulti[i] = isGrounded;
                }
            }
        }

        public override void OnPostGraphStarted()
        {
            base.OnPostGraphStarted();
            if (targetMode == TargetMode.SingleTarget) wasGrounded = target.value.isGrounded;
            if (targetMode == TargetMode.MultipleTargets)
                wasGroundedMulti = new bool[targets.value.Count];
        }

        protected override void RegisterPorts()
        {
            onHit = AddFlowOutput("Collider Hit");
            onGrounded = AddFlowOutput("On Grounded");
            onUnGrounded = AddFlowOutput("On UnGrounded");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Other", () => {
                return hitInfo.gameObject;
            });
            AddValueOutput("Collision Point", () => {
                return hitInfo.point;
            });
            AddValueOutput("Collision Info", () => {
                return hitInfo;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onControllerColliderHit += OnControllerColliderHit;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onControllerColliderHit -= OnControllerColliderHit;
        }

        private void OnControllerColliderHit(EventData<ControllerColliderHit> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            hitInfo = msg.value;
            onHit.Call(new Flow());
        }
    }
}
