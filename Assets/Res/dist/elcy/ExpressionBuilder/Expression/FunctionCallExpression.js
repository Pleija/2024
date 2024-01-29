import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
import { ValueExpression } from "./ValueExpression";
export class FunctionCallExpression {
    get type() {
        if (!this._type) {
            if (this.fnExpression instanceof ValueExpression) {
                try {
                    const fn = this.fnExpression.value;
                    switch (fn) {
                        case parseInt:
                        case parseFloat:
                            this._type = Number;
                            break;
                        case decodeURI:
                        case decodeURIComponent:
                        case encodeURI:
                        case encodeURIComponent:
                            this._type = String;
                            break;
                        case isNaN:
                        case isFinite:
                            this._type = Boolean;
                            break;
                        case eval:
                            this._type = Function;
                            break;
                        default:
                            try {
                                this._type = fn().constructor;
                            }
                            catch (e) { }
                    }
                }
                catch (e) {
                    return Object;
                }
            }
        }
        return this._type;
    }
    constructor(fnExpression, params, functionName) {
        if (fnExpression instanceof Function) {
            functionName = fnExpression.name;
            fnExpression = new ValueExpression(fnExpression);
        }
        else {
            functionName = fnExpression.toString();
        }
        this.fnExpression = fnExpression;
        this.params = params;
        this.functionName = functionName;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const fnExpression = resolveClone(this.fnExpression, replaceMap);
        const params = this.params.select((o) => resolveClone(o, replaceMap)).toArray();
        const clone = new FunctionCallExpression(fnExpression, params);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        let hash = hashCode(this.functionName);
        this.params.forEach((o, i) => hash = hashCodeAdd(hash, hashCodeAdd(i, o.hashCode())));
        return hash;
    }
    toString() {
        const paramStr = [];
        for (const param of this.params) {
            paramStr.push(param.toString());
        }
        return this.functionName + "(" + paramStr.join(", ") + ")";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVuY3Rpb25DYWxsRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FeHByZXNzaW9uQnVpbGRlci9FeHByZXNzaW9uL0Z1bmN0aW9uQ2FsbEV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFeEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE1BQU0sT0FBTyxzQkFBc0I7SUFDL0IsSUFBVyxJQUFJO1FBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNkLElBQUksSUFBSSxDQUFDLFlBQVksWUFBWSxlQUFlLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDO29CQUNELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO29CQUNuQyxRQUFRLEVBQVMsRUFBRSxDQUFDO3dCQUNoQixLQUFLLFFBQVEsQ0FBQzt3QkFDZCxLQUFLLFVBQVU7NEJBQ1gsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFhLENBQUM7NEJBQzNCLE1BQU07d0JBQ1YsS0FBSyxTQUFTLENBQUM7d0JBQ2YsS0FBSyxrQkFBa0IsQ0FBQzt3QkFDeEIsS0FBSyxTQUFTLENBQUM7d0JBQ2YsS0FBSyxrQkFBa0I7NEJBQ25CLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBYSxDQUFDOzRCQUMzQixNQUFNO3dCQUNWLEtBQUssS0FBSyxDQUFDO3dCQUNYLEtBQUssUUFBUTs0QkFDVCxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQWMsQ0FBQzs0QkFDNUIsTUFBTTt3QkFDVixLQUFLLElBQUk7NEJBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFlLENBQUM7NEJBQzdCLE1BQU07d0JBQ1Y7NEJB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