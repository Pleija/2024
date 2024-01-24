#region
using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;
#endregion

namespace NodeCanvas.Tasks.Conditions
{
    [Category("System Events")]
    public class CheckMouseClick : ConditionTask<Collider>
    {
        public MouseClickEvent checkType = MouseClickEvent.MouseDown;
        protected override string info => checkType.ToString();
        protected override bool OnCheck() => false;

        protected override void OnEnable()
        {
            router.onMouseDown += OnMouseDown;
            router.onMouseUp += OnMouseUp;
        }

        protected override void OnDisable()
        {
            router.onMouseDown -= OnMouseDown;
            router.onMouseUp -= OnMouseUp;
        }

        private void OnMouseDown(EventData msg)
        {
            if (checkType == MouseClickEvent.MouseDown) YieldReturn(true);
        }

        private void OnMouseUp(EventData msg)
        {
            if (checkType == MouseClickEvent.MouseUp) YieldReturn(true);
        }
    }
}
