import {StateFsm} from "Common/StateFsm.mjs";
import Blackboard = CS.NodeCanvas.Framework.Blackboard;
import ActionState = CS.NodeCanvas.StateMachines.ActionState;
import FSMState = CS.NodeCanvas.StateMachines.FSMState;
import FSM = CS.NodeCanvas.StateMachines.FSM;
import * as fs from "fs";
import Component = CS.UnityEngine.Component;
import {iterator} from "Common/Iterator.mjs";
import $typeof = puer.$typeof;

export class StateNode<T extends StateFsm> {
    stateFsm: StateFsm;
    fsm: FSM;
    node: CS.NodeCanvas.Framework.Node;
    agent: Component;
    _update = (s: StateNode<T>) => {
    };
    _enter = (s: StateNode<T>) => {
    };
    _exit = (s: StateNode<T>) => {
    };

    constructor(stateFsm: T) {
        this.stateFsm = stateFsm;
        const name = this.constructor.name;
        this.node = stateFsm.fsm.Find(name);
        this.node.jsBind = this;
        this.fsm = stateFsm.fsm;
        this.agent = this.fsm.agent;
        //console.log("methods:", getAllMethod(this).join(", "));
        //console.log("properties:",Object.keys(this).join(", "));
        //const self = this;
        // iterator(this.node.blackboard.variables).forEach((v, k) => {
        //     console.log(`[${stateFsm.constructor.name}] ${this.constructor.name}: bind ${k} => ${v.varType.FullName} null = ${v.value == null}`);
        //     this[k] = v.value;
        // });
        // const fn = stateFsm[name];
        //
        // if (fn) {
        //     console.log("Set Enter", name);
        //     this.onEnter(fn);
        // } else {
        //     console.log(`${stateFsm.fsm.FsmName}.${name} not set`)
        // }

    }

    onUpdate(fn: (t: StateNode<T>) => void) {
        this._update = (fn ?? (() => {
        })).bind(this.stateFsm);
    }

    onEnter(fn: (t: StateNode<T>) => void) {
        this._enter = (fn ?? (() => {
        })).bind(this.stateFsm);
    }

    onExit(fn: (t: StateNode<T>) => void) {
        this._exit = (fn ?? (() => {
        })).bind(this.stateFsm);
    }

    match() {
        //console.log("matched:", this.constructor.name)
        return true;
    }

    stopFsm() {

    }

}

// export const self:StateNode = global.StateNode ??= new StateNode();