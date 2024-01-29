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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVOb2RlLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1N0YXRlTm9kZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBZ0NBLE1BQU0sT0FBTyxTQUFTO0lBQ2xCLFFBQVEsQ0FBVztJQUNuQixHQUFHLENBQU07SUFDVCxJQUFJLENBQStCO0lBQ25DLEtBQUssQ0FBWTtJQUNqQixPQUFPLEdBQUcsQ0FBQyxDQUFlLEVBQUUsRUFBRTtJQUM5QixDQUFDLENBQUM7SUFDRixNQUFNLEdBQUcsQ0FBQyxDQUFlLEVBQUUsRUFBRTtJQUM3QixDQUFDLENBQUM7SUFDRixLQUFLLEdBQUcsQ0FBQyxDQUFlLEVBQUUsRUFBRTtJQUM1QixDQUFDLENBQUM7SUFFRixZQUFZLFFBQVc7UUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFDbkMsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDNUIseURBQXlEO1FBQ3pELDBEQUEwRDtRQUMxRCxvQkFBb0I7UUFDcEIsK0RBQStEO1FBQy9ELDRJQUE0STtRQUM1SSx5QkFBeUI7UUFDekIsTUFBTTtRQUNOLDZCQUE2QjtRQUM3QixFQUFFO1FBQ0YsWUFBWTtRQUNaLHNDQUFzQztRQUN0Qyx3QkFBd0I7UUFDeEIsV0FBVztRQUNYLDZEQUE2RDtRQUM3RCxJQUFJO0lBRVIsQ0FBQztJQUVELFFBQVEsQ0FBQyxFQUE2QjtRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsT0FBTyxDQUFDLEVBQTZCO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBNkI7UUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELEtBQUs7UUFDRCxnREFBZ0Q7UUFDaEQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELE9BQU87SUFFUCxDQUFDO0NBRUo7QUFFRCxzRUFBc0UifQ==