export class StateNode {
    stateFsm;
    fsm;
    node;
    agent;
    _update = (s) => {
    };
    _enter = (s) => {
    };
    _exit = (s) => {
    };
    constructor(stateFsm) {
        this.stateFsm = stateFsm;
        const name = this.constructor.name;
        this.node = stateFsm.fsm.Find(name);
        this.node.jsBind = this;
        this.fsm = stateFsm.fsm;
        this.agent = this.fsm.agent;
        //console.log("methods:", getAllMethod(stateFsm).join(", "));
        // const self = this;
        // iterator(this.node.blackboard.variables).forEach((v, k) => {
        //     console.log(`bind var: ${name}.${k} =>`, v.varType.FullName, v.value == null)
        //     self[k] = v.value;
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
    onUpdate(fn) {
        this._update = (fn ?? (() => {
        })).bind(this.stateFsm);
    }
    onEnter(fn) {
        this._enter = (fn ?? (() => {
        })).bind(this.stateFsm);
    }
    onExit(fn) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVOb2RlLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1N0YXRlTm9kZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsTUFBTSxPQUFPLFNBQVM7SUFDbEIsUUFBUSxDQUFXO0lBQ25CLEdBQUcsQ0FBTTtJQUNULElBQUksQ0FBK0I7SUFDbkMsS0FBSyxDQUFZO0lBQ2pCLE9BQU8sR0FBRyxDQUFDLENBQWUsRUFBRSxFQUFFO0lBQzlCLENBQUMsQ0FBQztJQUNGLE1BQU0sR0FBRyxDQUFDLENBQWUsRUFBRSxFQUFFO0lBQzdCLENBQUMsQ0FBQztJQUNGLEtBQUssR0FBRyxDQUFDLENBQWUsRUFBRSxFQUFFO0lBQzVCLENBQUMsQ0FBQztJQUVGLFlBQVksUUFBVztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztRQUNuQyxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUM1Qiw2REFBNkQ7UUFDN0QscUJBQXFCO1FBQ3JCLCtEQUErRDtRQUMvRCxvRkFBb0Y7UUFDcEYseUJBQXlCO1FBQ3pCLE1BQU07UUFDTiw2QkFBNkI7UUFDN0IsRUFBRTtRQUNGLFlBQVk7UUFDWixzQ0FBc0M7UUFDdEMsd0JBQXdCO1FBQ3hCLFdBQVc7UUFDWCw2REFBNkQ7UUFDN0QsSUFBSTtJQUVSLENBQUM7SUFFRCxRQUFRLENBQUMsRUFBNkI7UUFDbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELE9BQU8sQ0FBQyxFQUE2QjtRQUNqQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQTZCO1FBQ2hDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDMUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxLQUFLO1FBQ0QsZ0RBQWdEO1FBQ2hELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxPQUFPO0lBRVAsQ0FBQztDQUVKO0FBRUQsc0VBQXNFIn0=