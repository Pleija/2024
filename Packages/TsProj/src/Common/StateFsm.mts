import ActionState = CS.NodeCanvas.StateMachines.ActionState;
import FSM = CS.NodeCanvas.StateMachines.FSM;
import Blackboard = CS.NodeCanvas.Framework.Blackboard;
import FSMState = CS.NodeCanvas.StateMachines.FSMState;
import { iterator } from "Common/Iterator.mjs";
import { StateNode } from "Common/StateNode.mjs";

export class StateFsm {

    fsm: FSM;
    bb: Blackboard;

    constructor() {

    }

    sayHello() {
        console.log(...arguments)
    }

    bindFsm(f: FSM, bb: Blackboard) {
        this.fsm = f;
        this.bb = bb;
        f.jsBind = this;
        const self = this;
        iterator(bb.variables).forEach((value, key) => {
            self[key] = value.value;
        });
        this['init']?.();
        console.log("Init:", f.FsmName);

    }

    bindNode(s: FSMState) {
        if(!this[s.NodeName]) return;

        // console.log("Init Node:", s.NodeName);
        // if(this[s.NodeName]){
        //     s.jsBind = this[s.NodeName];
        //     this[s.NodeName].init?.();
        //     return;
        // }
        // console.log(`Node: ${s.NodeName} is undefined`)
        
    }

    exitNode(s: FSMState) {
        if(!this[s.NodeName]) return;

        console.log("Exit Node:", s.NodeName);
        //(s.jsBind as StateNode)?._exit(s.jsBind);
        this[s.NodeName].exit?.();
    }

    stop(s: FSMState) {
        if(!this[s.NodeName]) return;

        console.log("Stop:", s.FsmName);
        //(s.jsBind as StateNode).stopFsm();
        this[s.NodeName].stopFsm?.();
    }

    match(s: FSMState): boolean {
        if(!this[s.NodeName]) return;
        //return (s.jsBind as StateNode).match(s);
        return this[s.NodeName].match?.() ?? true;
    }

    enterNode(s: FSMState) {
        console.log("Enter Node:",this.fsm.FsmName, s.NodeName);
        if(!this[s.NodeName]){
            console.log(this.fsm.FsmName, s.NodeName, "not defined");
            return;
        } 
        //(s.jsBind as StateNode)?._enter(s.jsBind);
        const self = this[s.NodeName];
        iterator(s.blackboard.variables).forEach((value, key) => {
            self[key] = value.value;
        });
        this[s.NodeName].enter?.();
    }

    updateNode(s: FSMState) {
        if(!this[s.NodeName]) return;

        //(s.jsBind as StateNode)?._update(s.jsBind);
        this[s.NodeName].update?.();
    }
}

// export const self: StateFsm = global.StateFsm ??= new StateFsm();  
