import { iterator } from "Common/Iterator.mjs";
export class StateFsm {
    fsm;
    agent;
    gameObject;
    transform;
    blackboard;
    constructor() {
    }
    sayHello() {
        console.log(...arguments);
    }
    bindFsm(f, bb) {
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
        // const keys = Object.keys(this);
        // keys.forEach(key => {
        //     if (!this[key]) {
        //         console.log(`${this.constructor.name}.${key} is null`);
        //         return;
        //     }
        //     if (this[key].node?.blackboard) {
        //         iterator(this[key].node.blackboard.variables).forEach((v, k) => {
        //             console.log(`[${this[key].constructor.name}: bind ${k} => ${v.varType.FullName} null = ${v.value == null}`);
        //             this[key][k] = v.value;
        //         });
        //     }
        //     if (typeof this[key]['init'] == 'function') {
        //         //console.log("Init Node:", key);
        //         this[key].init();
        //     }
        //console.log(`${key}: ${person[key]}`);
        // });
    }
    bindNode(s) {
        if (!this[s.NodeName])
            return;
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
    exitNode(s) {
        if (!this[s.NodeName])
            return;
        console.log("Exit Node:", s.NodeName);
        //(s.jsBind as StateNode)?._exit(s.jsBind);
        this[s.NodeName].exit?.();
    }
    stop(s) {
        if (!this[s.NodeName])
            return;
        console.log("Stop:", s.FsmName);
        //(s.jsBind as StateNode).stopFsm();
        this[s.NodeName].stopFsm?.();
    }
    match(s) {
        if (!this[s.NodeName])
            return;
        //return (s.jsBind as StateNode).match(s);
        return this[s.NodeName].match?.() ?? true;
    }
    enterNode(s) {
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
    updateNode(s) {
        if (!this[s.NodeName])
            return;
        //(s.jsBind as StateNode)?._update(s.jsBind);
        this[s.NodeName].update?.();
    }
}
// export const self: StateFsm = global.StateFsm ??= new StateFsm();  
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVGc20ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3RhdGVGc20ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQVE3QyxNQUFNLE9BQU8sUUFBUTtJQUVqQixHQUFHLENBQU07SUFDVCxLQUFLLENBQVk7SUFDakIsVUFBVSxDQUFhO0lBQ3ZCLFNBQVMsQ0FBWTtJQUNyQixVQUFVLENBQWE7SUFFdkI7SUFFQSxDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQTtJQUM3QixDQUFDO0lBRUQsT0FBTyxDQUFDLENBQU0sRUFBRSxFQUFjO1FBQzFCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUM1QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUMxQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztRQUU1QyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNoQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7UUFDbEIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLElBQUksQ0FBQyxNQUFNLENB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