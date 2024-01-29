import { resolveClone } from "../../Helper/Util";
import { ObjectValueExpression } from "./ObjectValueExpression";
export class FunctionExpression {
    // TODO: type must always specified
    constructor(body, params, type) {
        this.body = body;
        this.params = params;
        this.type = type;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const params = this.params.select((o) => resolveClone(o, replaceMap)).toArray();
        const body = resolveClone(this.body, replaceMap);
        const clone = new FunctionExpression(body, params);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return this.body.hashCode();
    }
    toString() {
        const params = [];
        for (const param of this.params) {
            params.push(param.toString());
        }
        if (this.body instanceof ObjectValueExpression) {
            return "(" + params.join(", ") + ") => (" + this.body.toString() + ")";
        }
        return "(" + params.join(", ") + ") => " + this.body.toString();
    }
    toFunction() {
        // tslint:disable-next-line: no-eval
        return eval(this.toString());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVuY3Rpb25FeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9GdW5jdGlvbkV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWpELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR2hFLE1BQU0sT0FBTyxrQkFBa0I7SUFDM0IsbUNBQW1DO0lBQ25DLFlBQW1CLElBQW9CLEVBQVMsTUFBNkIsRUFBRSxJQUFxQjtRQUFqRixTQUFJLEdBQUosSUFBSSxDQUFnQjtRQUFTLFdBQU0sR0FBTixNQUFNLENBQXVCO1FBQ3pFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFHTSxLQUFLLENBQUMsVUFBMEM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEYsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakQsTUFBTSxLQUFLLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVNLFFBQVE7UUFDWCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxZQUFZLHFCQUFxQixFQUFFLENBQUM7WUFDN0MsT0FBTyxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDM0UsQ0FBQztRQUNELE9BQU8sR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDcEUsQ0FBQztJQUVNLFVBQVU7UUFDYixvQ0FBb0M7UUFDcEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNKIn0=