import { iterator } from "Common/Iterator.mjs";
var $typeof = puer.$typeof;
import { bindClass } from "Common/Helpers.mjs";
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
    constructor() {
    }
    bind($class) {
        if ($typeof($class) != null) {
            console.log($class.name + " is c# class: " + $typeof($class).FullName);
            //console.log(n.toString());
            const state = this.fsm.GetState($class.name);
            const component = state.bindComponent;
            const ret = bindClass(component, $class);
            // if (typeof ret['init'] == 'function') {
            //     ret['init']();
            // }
            return ret;
        }
        return new $class(this);
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
        const keys = Object.keys(this);
        keys.forEach(key => {
            //console.log(`check key: ${key}`);
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
    // bindNode(s: FSMState) {
    //     return;
    //     if (!this[s.NodeName]) return;
    //     iterator(this[s.NodeName].node.blackboard.variables).forEach((v, k) => {
    //         console.log(`[${this[s.NodeName].constructor.name}: bind ${k} => ${v.varType.FullName} null = ${v.value == null}`);
    //         this[s.NodeName][k] = v.value;
    //     });
    //     console.log("Init Node2:", s.NodeName);
    //     // if(this[s.NodeName]){
    //     s.jsBind = this[s.NodeName];
    //     this[s.NodeName].init?.();
    //     //     return;
    //     // }
    //     // console.log(`Node: ${s.NodeName} is undefined`)
    //
    // }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVGc20ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3RhdGVGc20ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQU8vQyxJQUFPLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBRzlCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUUvQyxxREFBcUQ7QUFDckQsd0JBQXdCO0FBQ3hCLHNCQUFzQjtBQUN0QixzQ0FBc0M7QUFDdEMsMkJBQTJCO0FBQzNCLFlBQVk7QUFDWixtQ0FBbUM7QUFDbkMsUUFBUTtBQUNSLG9CQUFvQjtBQUNwQixJQUFJO0FBRUosTUFBTSxPQUFPLFFBQVE7SUFRakI7SUFFQSxDQUFDO0lBRUQsSUFBSSxDQUFJLE1BQWtDO1FBQ3RDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkUsNEJBQTRCO1lBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDO1lBQ3RDLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFhLENBQUM7WUFDckQsMENBQTBDO1lBQzFDLHFCQUFxQjtZQUNyQixJQUFJO1lBQ0osT0FBTyxHQUFHLENBQUM7UUFDZixDQUFDO1FBQ0QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lB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