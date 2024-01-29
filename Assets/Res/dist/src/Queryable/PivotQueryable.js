import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { MethodCallExpression } from "../ExpressionBuilder/Expression/MethodCallExpression";
import { toObjectFunctionExpression } from "../Helper/ExpressionUtil";
import { hashCode, hashCodeAdd } from "../Helper/Util";
import { Queryable } from "./Queryable";
export class PivotQueryable extends Queryable {
    get dimensions() {
        if (!this._dimensions && this.dimensionFn) {
            this._dimensions = toObjectFunctionExpression(this.dimensionFn, this.parent.type, "d", this.stackTree.node);
        }
        return this._dimensions;
    }
    set dimensions(value) {
        this._dimensions = value;
    }
    get metrics() {
        if (!this._metrics && this.metricFn) {
            this._metrics = toObjectFunctionExpression(this.metricFn, this.parent.type, "m", this.stackTree.node);
        }
        return this._metrics;
    }
    set metrics(value) {
        this._metrics = value;
    }
    constructor(parent, dimensions, metrics) {
        super(Object, parent);
        this.parent = parent;
        if (dimensions instanceof FunctionExpression) {
            this.dimensions = dimensions;
        }
        else {
            this.dimensionFn = dimensions;
        }
        if (metrics instanceof FunctionExpression) {
            this.metrics = metrics;
        }
        else {
            this.metricFn = metrics;
        }
    }
    buildQuery(visitor) {
        const objectOperand = this.parent.buildQuery(visitor);
        const methodExpression = new MethodCallExpression(objectOperand, "pivot", [this.dimensions.clone(), this.metrics.clone()]);
        const visitParam = { selectExpression: objectOperand, scope: "queryable" };
        return visitor.visit(methodExpression, visitParam);
    }
    hashCode() {
        let code = this.dimensions.hashCode();
        code += this.metrics.hashCode();
        return hashCodeAdd(hashCode("PIVOT", this.parent.hashCode()), code);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGl2b3RRdWVyeWFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9RdWVyeWFibGUvUGl2b3RRdWVyeWFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDeEYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDNUYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd2RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSXhDLE1BQU0sT0FBTyxjQUdULFNBQVEsU0FBMkI7SUFDbkMsSUFBYyxVQUFVO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLDBCQUEwQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFzQixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xJLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUNELElBQWMsVUFBVSxDQUFDLEtBQUs7UUFDMUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUNELElBQWMsT0FBTztRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLFFBQVEsR0FBRywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBc0IsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1SCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFDRCxJQUFjLE9BQU8sQ0FBQyxLQUFLO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFDRCxZQUE0QixNQUFvQixFQUFFLFVBQTZDLEVBQUUsT0FBMEM7UUFDdkksS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQURFLFdBQU0sR0FBTixNQUFNLENBQWM7UUFFNUMsSUFBSSxVQUFVLFlBQVksa0JBQWtCLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUNqQyxDQUFDO2FBQ0ksQ0FBQztZQUNGLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQ2xDLENBQUM7UUFDRCxJQUFJLE9BQU8sWUFBWSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQzNCLENBQUM7YUFDSSxDQUFDO1lBQ0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDNUIsQ0FBQztJQUNMLENBQUM7SUFLTSxVQUFVLENBQUMsT0FBc0I7UUFDcEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUF3QixDQUFDO1FBQzdFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzSCxNQUFNLFVBQVUsR0FBeUIsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQ2pHLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQVEsQ0FBQztJQUM5RCxDQUFDO0lBQ00sUUFBUTtRQUNYLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEMsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEMsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNKIn0=