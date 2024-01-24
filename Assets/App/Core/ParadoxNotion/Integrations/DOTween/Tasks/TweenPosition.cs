#region
using System;
using DG.Tweening;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Actions
{
    [Category("Tween"), Icon("DOTTween", true)]
    public class TweenPosition : ActionTask<Transform>
    {
        public BBParameter<float> delay = 0f;
        public BBParameter<float> duration = 0.5f;
        public Ease easeType = Ease.Linear;
        private string id;
        public bool relative = false;
        public bool useSnapping = false;
        public BBParameter<Vector3> vector;
        public bool waitActionFinish = true;

        protected override string info => string.Format("Tween {0} Position {1} {2}", agentInfo,
            relative ? "By" : "To", vector);

        protected override void OnExecute()
        {
            if (!relative && (agent.position - vector.value).sqrMagnitude <= 0.01f) {
                EndAction();
                return;
            }
            var tween = agent.DOMove(vector.value, duration.value, useSnapping);
            tween.SetDelay(delay.value);
            tween.SetEase(easeType);
            id = Guid.NewGuid().ToString();
            tween.SetId(id);
            if (relative) tween.SetRelative();
            if (!waitActionFinish) EndAction();
        }

        protected override void OnUpdate()
        {
            if (elapsedTime >= duration.value + delay.value) EndAction();
        }

        protected override void OnStop()
        {
            if (waitActionFinish) DOTween.Kill(id);
        }
    }
}
