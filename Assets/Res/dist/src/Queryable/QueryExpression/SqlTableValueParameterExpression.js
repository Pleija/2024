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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsVGFibGVWYWx1ZVBhcmFtZXRlckV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL1NxbFRhYmxlVmFsdWVQYXJhbWV0ZXJFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVqRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVsRSxNQUFNLE9BQU8sZ0NBQTBDLFNBQVEsc0JBQTJCO0lBQ3RGLFlBQVksSUFBWSxFQUFFLFFBQTBCLEVBQVMsVUFBNkI7UUFDdEYsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQURtQyxlQUFVLEdBQVYsVUFBVSxDQUFtQjtJQUUxRixDQUFDO0lBQ00sS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM1RCxNQUFNLEtBQUssR0FBRyxJQUFJLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1RixVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQ0oifQ==