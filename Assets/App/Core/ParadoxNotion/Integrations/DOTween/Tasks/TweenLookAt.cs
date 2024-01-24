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
    public class TweenLookAt : ActionTask<Transform>
    {
        public BBParameter<AxisConstraint> axisConstraint = AxisConstraint.None;
        public BBParameter<float> delay = 0f;
        public BBParameter<float> duration = 0.5f;
        public Ease easeType = Ease.Linear;
        private string id;
        public BBParameter<Vector3> vector;
        public bool waitActionFinish = true;
        protected override string info => string.Format("Tween {0} LookAt {1}", agentInfo, vector);

        protected override void OnExecute()
        {
            var tween = agent.DOLookAt(vector.value, duration.value, axisConstraint.value);
            tween.SetDelay(delay.value);
            tween.SetEase(easeType);
            id = Guid.NewGuid().ToString();
            tween.SetId(id);
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
