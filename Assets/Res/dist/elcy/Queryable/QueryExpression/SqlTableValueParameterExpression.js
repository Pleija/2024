import { resolveClone } from "../../Helper/Util";
import { SqlParameterExpression } from "./SqlParameterExpression";
export class SqlTableValueParameterExpression extends SqlParameterExpression {
    constructor(name, valueExp, entityMeta) {
        super(name, valueExp);
        this.entityMeta = entityMeta;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const valueGetter = resolveClone(this.valueExp, replaceMap);
        const clone = new SqlTableValueParameterExpression(this.name, valueGetter, this.entityMeta);
        replaceMap.set(this, clone);
        return clone;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsVGFibGVWYWx1ZVBhcmFtZXRlckV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUXVlcnlhYmxlL1F1ZXJ5RXhwcmVzc2lvbi9TcWxUYWJsZVZhbHVlUGFyYW1ldGVyRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFakQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFbEUsTUFBTSxPQUFPLGdDQUEwQyxTQUFRLHNCQUEyQjtJQUN0RixZQUFZLElBQVksRUFBRSxRQUEwQixFQUFTLFVBQTZCO1FBQ3RGLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFEbUMsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7SUFFMUYsQ0FBQztJQUNNLEtBQUssQ0FBQyxVQUEwQztRQUNuRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDNUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUYsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKIn0=