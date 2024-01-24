#region
using System.Collections.Generic;
using ParadoxNotion;
using ParadoxNotion.Design;
using ParadoxNotion.Services;
using UnityEngine;
#endregion

namespace FlowCanvas.Nodes
{
    [Name("Particle Collision"), Category("Events/Object"),
     Description("Called when any Particle System collided with the target collider object")]
    public class ParticleCollisionEvents : RouterEventNode<Collider>
    {
        private List<ParticleCollisionEvent> collisionEvents;
        private FlowOutput onCollision;
        private ParticleSystem particle;
        private Collider receiver;

        protected override void RegisterPorts()
        {
            onCollision = AddFlowOutput("On Particle Collision");
            AddValueOutput("Receiver", () => {
                return receiver;
            });
            AddValueOutput("Particle System", () => {
                return particle;
            });
            AddValueOutput("Collision Point", () => {
                return collisionEvents[0].intersection;
            });
            AddValueOutput("Collision Normal", () => {
                return collisionEvents[0].normal;
            });
            AddValueOutput("Collision Velocity", () => {
                return collisionEvents[0].velocity;
            });
        }

        protected override void Subscribe(EventRouter router)
        {
            router.onParticleCollision += OnParticleCollision;
        }

        protected override void UnSubscribe(EventRouter router)
        {
            router.onParticleCollision -= OnParticleCollision;
        }

        private void OnParticleCollision(EventData<GameObject> msg)
        {
            receiver = ResolveReceiver(msg.receiver);
            particle = msg.value.GetComponent<ParticleSystem>();
            collisionEvents = new List<ParticleCollisionEvent>();
            if (particle != null) particle.GetCollisionEvents(receiver.gameObject, collisionEvents);
            onCollision.Call(new Flow());
        }
    }
}
