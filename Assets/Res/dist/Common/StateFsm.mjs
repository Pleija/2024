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
    fsm;
    agent;
    gameObject;
    transform;
    blackboard;
    constructor() {
    }
    bind($class) {
        if ($typeof($class) != null) {
            console.log($class.name + " is c# class: " + $typeof($class).FullName);
            //console.log(n.toString());
            const state = this.fsm.GetState($class.name);
            const component = state.bindComponent;
            return bindClass(component, $class);
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
    bindNode(s) {
        return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVGc20ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3RhdGVGc20ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQU83QyxJQUFPLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBRzlCLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUU3QyxxREFBcUQ7QUFDckQsd0JBQXdCO0FBQ3hCLHNCQUFzQjtBQUN0QixzQ0FBc0M7QUFDdEMsMkJBQTJCO0FBQzNCLFlBQVk7QUFDWixtQ0FBbUM7QUFDbkMsUUFBUTtBQUNSLG9CQUFvQjtBQUNwQixJQUFJO0FBRUosTUFBTSxPQUFPLFFBQVE7SUFFakIsR0FBRyxDQUFNO0lBQ1QsS0FBSyxDQUFZO0lBQ2pCLFVBQVUsQ0FBYTtJQUN2QixTQUFTLENBQVk7SUFDckIsVUFBVSxDQUFhO0lBRXZCO0lBRUEsQ0FBQztJQUVELElBQUksQ0FBSSxNQUFrQztRQUN0QyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZFLDRCQUE0QjtZQUM1QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztZQUN0QyxPQUFPLFNBQVMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFhLENBQUM7UUFDcEQsQ0FBQztRQUNELE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7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