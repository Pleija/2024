export class StateNode {
    constructor(stateFsm) {
        this._update = (s) => {
        };
        this._enter = (s) => {
        };
        this._exit = (s) => {
        };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVOb2RlLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1N0YXRlTm9kZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBZ0NBLE1BQU0sT0FBTyxTQUFTO0lBWWxCLFlBQVksUUFBVztRQVB2QixZQUFPLEdBQUcsQ0FBQyxDQUFlLEVBQUUsRUFBRTtRQUM5QixDQUFDLENBQUM7UUFDRixXQUFNLEdBQUcsQ0FBQyxDQUFlLEVBQUUsRUFBRTtRQUM3QixDQUFDLENBQUM7UUFDRixVQUFLLEdBQUcsQ0FBQyxDQUFlLEVBQUUsRUFBRTtRQUM1QixDQUFDLENBQUM7UUFHRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztRQUNuQyxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUM1Qix5REFBeUQ7UUFDekQsMERBQTBEO1FBQzFELG9CQUFvQjtRQUNwQiwrREFBK0Q7UUFDL0QsNElBQTRJO1FBQzVJLHlCQUF5QjtRQUN6QixNQUFNO1FBQ04sNkJBQTZCO1FBQzdCLEVBQUU7UUFDRixZQUFZO1FBQ1osc0NBQXNDO1FBQ3RDLHdCQUF3QjtRQUN4QixXQUFXO1FBQ1gsNkRBQTZEO1FBQzdELElBQUk7SUFFUixDQUFDO0lBRUQsUUFBUSxDQUFDLEVBQTZCO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxPQUFPLENBQUMsRUFBNkI7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELE1BQU0sQ0FBQyxFQUE2QjtRQUNoQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQzFCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsS0FBSztRQUNELGdEQUFnRDtRQUNoRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsT0FBTztJQUVQLENBQUM7Q0FFSjtBQUVELHNFQUFzRSJ9