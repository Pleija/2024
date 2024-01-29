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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVuY3Rpb25DYWxsRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0V4cHJlc3Npb25CdWlsZGVyL0V4cHJlc3Npb24vRnVuY3Rpb25DYWxsRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUV4RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsTUFBTSxPQUFPLHNCQUFzQjtJQUMvQixJQUFXLElBQUk7UUFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsSUFBSSxJQUFJLENBQUMsWUFBWSxZQUFZLGVBQWUsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLENBQUM7b0JBQ0QsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7b0JBQ25DLFFBQVEsRUFBUyxFQUFFLENBQUM7d0JBQ2hCLEtBQUssUUFBUSxDQUFDO3dCQUNkLEtBQUssVUFBVTs0QkFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQWEsQ0FBQzs0QkFDM0IsTUFBTTt3QkFDVixLQUFLLFNBQVMsQ0FBQzt3QkFDZixLQUFLLGtCQUFrQixDQUFDO3dCQUN4QixLQUFLLFNBQVMsQ0FBQzt3QkFDZixLQUFLLGtCQUFrQjs0QkFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFhLENBQUM7NEJBQzNCLE1BQU07d0JBQ1YsS0FBSyxLQUFLLENBQUM7d0JBQ1gsS0FBSyxRQUFROzRCQUNULElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBYyxDQUFDOzRCQUM1QixNQUFNO3dCQUNWLEtBQUssSUFBSTs0QkFDTCxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQWUsQ0FBQzs0QkFDN0IsTUFBTTt3QkFDVjs0QkFD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