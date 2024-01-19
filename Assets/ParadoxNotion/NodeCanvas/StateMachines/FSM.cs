using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using MoreTags;
using NodeCanvas.Framework;
using ParadoxNotion.Design;
using UnityEngine;
using Logger = ParadoxNotion.Services.Logger;
using ParadoxNotion;
using Puerts;
using Sirenix.Utilities;
using Zu.TypeScript;
using Zu.TypeScript.Change;
using Zu.TypeScript.TsTypes;

namespace NodeCanvas.StateMachines
{
    ///<summary> Use FSMs to create state like behaviours</summary>
    [GraphInfo(packageName = "NodeCanvas", docsURL = "https://nodecanvas.paradoxnotion.com/documentation/",
         resourcesURL = "https://nodecanvas.paradoxnotion.com/downloads/",
         forumsURL = "https://nodecanvas.paradoxnotion.com/forums-page/"),
     CreateAssetMenu(menuName = "ParadoxNotion/NodeCanvas/FSM Asset")]
    public class FSM : Graph
    {
        ///<summary>Transition Calling Mode (see "EnterState")</summary>
        public enum TransitionCallMode { Normal = 0, Stacked = 1, Clean = 2 }

        private List<IUpdatable> updatableNodes;
        private IStateCallbackReceiver[] callbackReceivers;
        private Stack<FSMState> stateStack;
        private bool enterStartStateFlag;
        public event Action<IState> onStateEnter;
        public event Action<IState> onStateUpdate;
        public event Action<IState> onStateExit;
        public event Action<IState> onStateTransition;

        public FSMState GetState(string nodeName) => allNodes.OfType<FSMState>().FirstOrDefault(x => x.name == nodeName);

        ///<summary>The current FSM state</summary>
        public FSMState currentState { get; private set; }

        ///<summary>The previous FSM state</summary>
        public FSMState previousState { get; private set; }

        ///<summary>The current state name. Null if none</summary>
        public string currentStateName => currentState != null ? currentState.name : null;

        ///<summary>The previous state name. Null if none</summary>
        public string previousStateName => previousState != null ? previousState.name : null;

        public override System.Type baseNodeType => typeof(FSMNode);
        public override bool requiresAgent => true;
        public override bool requiresPrimeNode => true;
        public override bool isTree => false;
        public override bool allowBlackboardOverrides => true;
        public sealed override bool canAcceptVariableDrops => false;
        public sealed override PlanarDirection flowDirection => PlanarDirection.Auto;

        public bool isReady => agent != null && !agent.name.Contains(".") && !agent.name.Contains("(") &&
            !agent.name.Contains(" ");

        protected override void OnGraphValidate()
        {
            if (!Application.isEditor || !isReady) return;
            TagSystem.AddTag("FSM." + FsmName);
            //CheckVarsFromTs(MakeFile(), blackboard);
            // allNodes.Where(x => x is FSMState).ForEach(node => {
            //     CheckVarsFromTs(node.MakeFile(), node.blackboard);
            // });
        }

        ///----------------------------------------------------------------------------------------------
        protected override void OnGraphInitialize()
        {
            //we may be loading in async
            ThreadSafeInitCall(GatherCallbackReceivers);
            updatableNodes = new List<IUpdatable>();
            for (var i = 0; i < allNodes.Count; i++)
                if (allNodes[i] is IUpdatable)
                    updatableNodes.Add((IUpdatable)allNodes[i]);
        }

        protected override void OnGraphStarted()
        {
            stateStack = new Stack<FSMState>();
            enterStartStateFlag = true;
            if (!agent.GetComponent<GraphOwner>().startCalled)
                Invoke("bindFsm", this, blackboard);
            else
                Invoke("enable");
        }

        protected override void OnGraphUpdate()
        {
            if (primeNode == null) return;

            if (enterStartStateFlag) {
                //use a flag so that other nodes can do stuff on graph started
                enterStartStateFlag = false;
                //todo: 添加首个node标志
                ((FSMState)primeNode).isPrime = true;
                EnterState((FSMState)primeNode, TransitionCallMode.Normal);
            }

            if (currentState != null) {
                //Update defer IUpdatables
                for (var i = 0; i < updatableNodes.Count; i++) updatableNodes[i].Update();

                //this can only happen if FSM stoped just now (from the above update)
                if (currentState == null) {
                    Stop(false);
                    return;
                }

                //Update current state
                currentState.Execute(agent, blackboard);

                //this can only happen if FSM stoped just now (from the above update)
                if (currentState == null) {
                    Stop(false);
                    return;
                }
                if (onStateUpdate != null && currentState.status == Status.Running) onStateUpdate(currentState);

                //this can only happen if FSM stoped just now (from the above update)
                if (currentState == null) {
                    Stop(false);
                    return;
                }

                //state has nowhere to go..
                if (currentState.status != Status.Running && currentState.outConnections.Count == 0) {
                    //...but we have a stacked state -> pop return to it
                    if (stateStack.Count > 0) {
                        var popState = stateStack.Pop();
                        EnterState(popState, TransitionCallMode.Normal);
                        return;
                    }

                    //...and no updatables -> stop
                    if (!updatableNodes.Any(n => n.status == Status.Running)) {
                        Stop(true);
                        return;
                    }
                }
            }

            //if null state, stop.
            if (currentState == null) {
                Stop(false);
                return;
            }
        }

        protected override void OnGraphStoped()
        {
            if (currentState != null)
                if (onStateExit != null)
                    onStateExit(currentState);
            Invoke("disable");
            previousState = null;
            currentState = null;
            stateStack = null;
        }

        public void Invoke(string fn, params object[] param)
        {
            if (Js.Env.Eval<JSObject>($"${FsmName}?.{fn}") == null)
                //Debug.Log($"${FsmName}.{fn} is undefined");
                return;

            switch (param.Length) {
                case 0:
                    Js.Env.Eval<Action>($"${FsmName}.{fn}.bind(${FsmName})")?.Invoke();
                    break;
                case 1:
                    Js.Env.Eval<Action<object>>($"${FsmName}.{fn}.bind(${FsmName})")?.Invoke(param[0]);
                    break;
                case 2:
                    Js.Env.Eval<Action<object, object>>($"${FsmName}.{fn}.bind(${FsmName})")
                        .Invoke(param[0], param[1]);
                    break;
                case 3:
                    Js.Env.Eval<Action<object, object, object>>($"${FsmName}.{fn}.bind(${FsmName})")
                        .Invoke(param[0], param[1], param[2]);
                    break;
                case 4:
                    Js.Env.Eval<Action<object, object, object, object>>($"${FsmName}.{fn}.bind(${FsmName})")
                        .Invoke(param[0], param[1], param[2], param[4]);
                    break;
                default: return;
            }
        }

        public T InvokeFunc<T>(string fn, params object[] param)
        {
            if (Js.Env.Eval<JSObject>($"${FsmName}?.{fn}") != null)
                return param.Length switch {
                    0 => Js.Env.Eval<Func<T>>($"${FsmName}.{fn}.bind(${FsmName})").Invoke(),
                    1 => Js.Env.Eval<Func<object, T>>($"${FsmName}.{fn}.bind(${FsmName})").Invoke(param[0]),
                    2 => Js.Env.Eval<Func<object, object, T>>($"${FsmName}.{fn}.bind(${FsmName})")
                        .Invoke(param[0], param[1]),
                    3 => Js.Env.Eval<Func<object, object, object, T>>($"${FsmName}.{fn}.bind(${FsmName})")
                        .Invoke(param[0], param[1], param[2]),
                    4 => Js.Env.Eval<Func<object, object, object, object, T>>($"${FsmName}.{fn}.bind(${FsmName})")
                        .Invoke(param[0], param[1], param[2], param[4]),
                    _ => default,
                };
            Debug.Log($"${FsmName}.{fn} is undefined");
            return default;
        }

        ///<summary>Enter a state providing the state itself</summary>
        public bool EnterState(FSMState newState, TransitionCallMode callMode)
        {
            if (!isRunning) {
                Logger.LogWarning("Tried to EnterState on an FSM that was not running", LogTag.EXECUTION, this);
                return false;
            }

            if (newState == null) {
                Logger.LogWarning("Tried to Enter Null State", LogTag.EXECUTION, this);
                return false;
            }

            //todo: 添加tags判断
            //newState.CheckJsBind();
            if (!string.IsNullOrEmpty(newState.customName) && !InvokeFunc<bool>("match", newState)) return false;

            if (currentState != null) {
                if (onStateExit != null) onStateExit(currentState);
                //currentState.CheckJsBind();
                // JsEnv.self.Eval<Action<FSMState>>($"${FsmName}.exitNode.bind(${FsmName})").Invoke(currentState);
                currentState.Reset(false);

                if (callMode == TransitionCallMode.Stacked) {
                    stateStack.Push(currentState);
                    if (stateStack.Count > 5)
                        Logger.LogWarning("State stack exceeds 5. Ensure that you are not cycling stack calls",
                            LogTag.EXECUTION, this);
                }
            }
            if (callMode == TransitionCallMode.Clean) stateStack.Clear();
            previousState = currentState;
            currentState = newState;
            if (onStateTransition != null) onStateTransition(currentState);
            if (onStateEnter != null) onStateEnter(currentState);
            currentState.Execute(agent, blackboard);
            return true;
        }

        ///<summary>Trigger a state to enter by it's name. Returns the state found and entered if any</summary>
        public FSMState TriggerState(string stateName, TransitionCallMode callMode)
        {
            var state = GetStateWithName(stateName);

            if (state != null) {
                EnterState(state, callMode);
                return state;
            }
            Logger.LogWarning("No State with name '" + stateName + "' found on FSM '" + name + "'", LogTag.EXECUTION,
                this);
            return null;
        }

        ///<summary>Get all State Names</summary>
        public string[] GetStateNames()
        {
            return allNodes.Where(n => n is FSMState).Select(n => n.name).ToArray();
        }

        ///<summary>Get a state by it's name</summary>
        public FSMState GetStateWithName(string name)
        {
            return (FSMState)allNodes.Find(n => n is FSMState && n.name == name);
        }

        //Gather IStateCallbackReceivers and subscribe them to state events
        private void GatherCallbackReceivers()
        {
            if (agent == null) return;
            callbackReceivers = agent.gameObject.GetComponents<IStateCallbackReceiver>();

            if (callbackReceivers.Length > 0) {
                onStateEnter += (x) => {
                    foreach (var m in callbackReceivers) m.OnStateEnter(x);
                };
                onStateUpdate += (x) => {
                    foreach (var m in callbackReceivers) m.OnStateUpdate(x);
                };
                onStateExit += (x) => {
                    foreach (var m in callbackReceivers) m.OnStateExit(x);
                };
            }
        }

        public FSMState PeekStack() => stateStack != null && stateStack.Count > 0 ? stateStack.Peek() : null;
        ///----------------------------------------------------------------------------------------------
        ///---------------------------------------UNITY EDITOR-------------------------------------------
#if UNITY_EDITOR
        [UnityEditor.MenuItem("Tools/ParadoxNotion/NodeCanvas/Create/State Machine Asset", false, 1)]
        private static void Editor_CreateGraph()
        {
            var newGraph = EditorUtils.CreateAsset<FSM>();
            UnityEditor.Selection.activeObject = newGraph;
        }
#endif
    }
}
