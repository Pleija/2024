import ActionState = CS.NodeCanvas.StateMachines.ActionState;
import FSM = CS.NodeCanvas.StateMachines.FSM;
import Blackboard = CS.NodeCanvas.Framework.Blackboard;
import FSMState = CS.NodeCanvas.StateMachines.FSMState;
import {iterator} from "Common/Iterator.mjs";
import {StateNode} from "Common/StateNode.mjs";
import MonoBehaviour = CS.UnityEngine.MonoBehaviour;
import GameObject = CS.UnityEngine.GameObject;
import Transform = CS.UnityEngine.Transform;
import FSMOwner = CS.NodeCanvas.StateMachines.FSMOwner;
import Component = CS.UnityEngine.Component;
import $typeof = puer.$typeof;
import Debug = CS.UnityEngine.Debug;
import Type = CS.System.Type;
import {bindClass} from "Common/Helpers.mjs";

// const isParent = (type: any, parentType: any) => {
//     let _type = type;
//     while (_type) {
//         if (_type === parentType) {
//             return true;
//         }
//         _type = _type.__proto__;
//     }
//     return false;
// }

export class StateFsm {

    fsm: FSM;
    agent: Component;
    gameObject: GameObject;
    transform: Transform;
    blackboard: Blackboard;

    constructor() {

    }

    bind<T>($class: { new(...args: any[]): T }): T {
        if ($typeof($class) != null) {
            console.log($class.name + " is c# class: " + $typeof($class).FullName);
            //console.log(n.toString());
            const state = this.fsm.GetState($class.name);
            const component = state.bindComponent;
            return bindClass(component, $class) as any as T;
        }
        return new $class(this);
    }


    sayHello() {
        console.log(...arguments)
    }

    bindFsm(f: FSM, bb: Blackboard) {
        this.fsm = f;
        this.agent = this.fsm.agent;
        this.transform = this.fsm.agent.transform;
        this.gameObject = this.fsm.agent.gameObject;

        this.blackboard = bb;
        f.jsBind = this;
        const self = this;
        iterator(bb.variables).forEach((value, key) => {
            self[key] = value.value;
        });

        if (this['init']) {
            //console.log("Init:", f.FsmName);
            this['init']?.();
        }

        //
        const keys = Object.keys(this);
        keys.forEach(key => {
            if (!this[key]) {
                console.log(`${this.constructor.name}.${key} is null`);
                return;
            }
            if (this[key].node?.blackboard) {
                iterator(this[key].node.blackboard.variables).forEach((v, k) => {
                    console.log(`[${this[key].constructor.name}: bind ${k} => ${v.varType.FullName} null = ${v.value == null}`);
                    this[key][k] = v.value;
                });
            }
            if (typeof this[key]['init'] == 'function') {
                //console.log("Init Node:", key);
                this[key].init();
            }

            //console.log(`${key}: ${person[key]}`);
        });


    }

    bindNode(s: FSMState) {
        return;
        if (!this[s.NodeName]) return;
        iterator(this[s.NodeName].node.blackboard.variables).forEach((v, k) => {
            console.log(`[${this[s.NodeName].constructor.name}: bind ${k} => ${v.varType.FullName} null = ${v.value == null}`);
            this[s.NodeName][k] = v.value;
        });
        console.log("Init Node2:", s.NodeName);
        // if(this[s.NodeName]){
        s.jsBind = this[s.NodeName];
        this[s.NodeName].init?.();
        //     return;
        // }
        // console.log(`Node: ${s.NodeName} is undefined`)

    }

    exitNode(s: FSMState) {
        if (!this[s.NodeName]) return;

        console.log("Exit Node:", s.NodeName);
        //(s.jsBind as StateNode)?._exit(s.jsBind);
        this[s.NodeName].exit?.();
    }

    stop(s: FSMState) {
        if (!this[s.NodeName]) return;

        console.log("Stop:", s.FsmName);
        //(s.jsBind as StateNode).stopFsm();
        this[s.NodeName].stopFsm?.();
    }

    match(s: FSMState): boolean {
        if (!this[s.NodeName]) return;
        //return (s.jsBind as StateNode).match(s);
        return this[s.NodeName].match?.() ?? true;
    }

    enterNode(s: FSMState) {
        if (!this[s.NodeName]) {
            //console.log(this.fsm.FsmName, s.NodeName, "not defined");
            return;
        }
        console.log("Enter Node:", this.fsm.FsmName, s.NodeName);
        //(s.jsBind as StateNode)?._enter(s.jsBind);
        const self = this[s.NodeName];
        iterator(s.blackboard.variables).forEach((value, key) => {
            self[key] = value.value;
        });
        this[s.NodeName].enter?.();
    }

    updateNode(s: FSMState) {
        if (!this[s.NodeName]) return;

        //(s.jsBind as StateNode)?._update(s.jsBind);
        this[s.NodeName].update?.();
    }
}

// export const self: StateFsm = global.StateFsm ??= new StateFsm();  
