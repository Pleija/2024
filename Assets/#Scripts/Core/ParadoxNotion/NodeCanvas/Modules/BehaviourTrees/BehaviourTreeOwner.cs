﻿using NodeCanvas.Framework;
using UnityEngine;

namespace NodeCanvas.BehaviourTrees
{
    ///<summary> Use this component on a game object to behave based on a BehaviourTree.</summary>
    [AddComponentMenu("NodeCanvas/Behaviour Tree Owner")]
    public class BehaviourTreeOwner : GraphOwner<BehaviourTree>
    {
        ///<summary>Should the assigned BT reset and re-execute after a cycle? Sets the BehaviourTree's repeat</summary>
        public bool repeat {
            get => behaviour != null ? behaviour.repeat : true;
            set {
                if (behaviour != null) behaviour.repeat = value;
            }
        }

        ///<summary>The interval in seconds to update the BT. 0 for every frame. Sets the BehaviourTree's updateInterval</summary>
        public float updateInterval {
            get => behaviour != null ? behaviour.updateInterval : 0;
            set {
                if (behaviour != null) behaviour.updateInterval = value;
            }
        }

        ///<summary>The last status of the assigned Behaviour Tree's root node (aka Start Node)</summary>
        public Status rootStatus => behaviour != null ? behaviour.rootStatus : Status.Resting;

        ///<summary>Ticks the assigned Behaviour Tree for this owner agent and returns it's root status</summary>
        public Status Tick()
        {
            if (behaviour == null) {
                ParadoxNotion.Services.Logger.LogWarning("There is no Behaviour Tree assigned", LogTag.EXECUTION
                    , gameObject);
                return Status.Resting;
            }
            UpdateBehaviour();
            return behaviour.rootStatus;
        }
    }
}
