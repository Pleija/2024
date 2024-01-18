﻿using NodeCanvas.Framework;
using ParadoxNotion;
using ParadoxNotion.Design;
using UnityEngine;

namespace NodeCanvas.Tasks.Conditions
{
    [Category("System Events"), Name("Check Mouse 2D")]
    public class CheckMouse2D : ConditionTask<Collider2D>
    {
        public MouseInteractionTypes checkType = MouseInteractionTypes.MouseEnter;
        protected override string info => checkType.ToString();

        protected override void OnEnable()
        {
            router.onMouseEnter += OnMouseEnter;
            router.onMouseExit += OnMouseExit;
            router.onMouseOver += OnMouseOver;
        }

        protected override void OnDisable()
        {
            router.onMouseEnter -= OnMouseEnter;
            router.onMouseExit -= OnMouseExit;
            router.onMouseOver -= OnMouseOver;
        }

        protected override bool OnCheck() => false;

        private void OnMouseEnter(EventData msg)
        {
            if (checkType == MouseInteractionTypes.MouseEnter) YieldReturn(true);
        }

        private void OnMouseExit(EventData msg)
        {
            if (checkType == MouseInteractionTypes.MouseExit) YieldReturn(true);
        }

        private void OnMouseOver(EventData msg)
        {
            if (checkType == MouseInteractionTypes.MouseOver) YieldReturn(true);
        }
    }
}
