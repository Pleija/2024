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
        //console.log("Exit Node:", s.NodeName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVGc20ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3RhdGVGc20ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQU8vQyxJQUFPLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBRzlCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUUvQyxxREFBcUQ7QUFDckQsd0JBQXdCO0FBQ3hCLHNCQUFzQjtBQUN0QixzQ0FBc0M7QUFDdEMsMkJBQTJCO0FBQzNCLFlBQVk7QUFDWixtQ0FBbUM7QUFDbkMsUUFBUTtBQUNSLG9CQUFvQjtBQUNwQixJQUFJO0FBRUosTUFBTSxPQUFPLFFBQVE7SUFFakIsR0FBRyxDQUFNO0lBQ1QsS0FBSyxDQUFZO0lBQ2pCLFVBQVUsQ0FBYTtJQUN2QixTQUFTLENBQVk7SUFDckIsVUFBVSxDQUFhO0lBRXZCO0lBRUEsQ0FBQztJQUVELElBQUksQ0FBSSxNQUFrQztRQUN0QyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZFLDRCQUE0QjtZQUM1QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztZQUN0QyxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBYSxDQUFDO1lBQ3JELDBDQUEwQztZQUMxQyxxQkFBcUI7WUFDckIsSUFBSTtZQUNK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