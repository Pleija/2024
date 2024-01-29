import { Enumerable } from "../../Enumerable/Enumerable";
import { hashCode, hashCodeAdd, resolveClone } from "../../Helper/Util";
import { Queryable } from "../../Queryable/Queryable";
export class MethodCallExpression {
    get itemType() {
        if (this.type === Array) {
            return this.objectOperand.itemType;
        }
        return null;
    }
    get type() {
        if (!this._type && this.objectOperand.type) {
            try {
                const objectType = this.objectOperand.type;
                if (objectType === Array || Queryable.isPrototypeOf(objectType) || Enumerable.isPrototypeOf(objectType)) {
                    switch (this.methodName) {
                        case "min":
                        case "max":
                        case "count":
                        case "sum": {
                            this._type = Number;
                            break;
                        }
                        case "contains":
                        case "any":
                        case "all": {
                            this._type = Boolean;
                            break;
                        }
                        case "first": {
                            this._type = this.objectOperand.itemType;
                            break;
                        }
                        default: {
                            this._type = Array;
                            break;
                        }
                    }
                }
                else if (objectType === Date) {
                    const objectInstance = new objectType();
                    this.type = objectInstance[this.methodName]().constructor;
                }
                else {
                    this.type = objectType.prototype[this.methodName]().constructor;
                }
            }
            catch (e) {
                this._type = Object;
            }
        }
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    constructor(objectOperand, method, params, type) {
        this.objectOperand = objectOperand;
        this.params = params;
        this._type = type;
        if (typeof method === "function") {
            this.methodName = method.name;
        }
        else {
            this.methodName = method;
        }
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const objectOperand = resolveClone(this.objectOperand, replaceMap);
        const params = this.params.select((o) => resolveClone(o, replaceMap)).toArray();
        const clone = new MethodCallExpression(objectOperand, this.methodName, params, this.type);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        let hash = hashCode("." + this.methodName, this.objectOperand.hashCode());
        this.params.forEach((o, i) => hash = hashCodeAdd(hash, hashCodeAdd(i, o.hashCode())));
        return hash;
    }
    toString() {
        const paramStr = [];
        for (const param of this.params) {
            paramStr.push(param.toString());
        }
        return this.objectOperand.toString() + "." + this.methodName + "(" + paramStr.join(", ") + ")";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0aG9kQ2FsbEV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9FeHByZXNzaW9uQnVpbGRlci9FeHByZXNzaW9uL01ldGhvZENhbGxFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN4RSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFJdEQsTUFBTSxPQUFPLG9CQUFvQjtJQUM3QixJQUFXLFFBQVE7UUFDZixJQUFLLElBQUksQ0FBQyxJQUFZLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDL0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNELElBQVcsSUFBSTtRQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDO2dCQUNELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBVyxDQUFDO2dCQUNsRCxJQUFJLFVBQVUsS0FBSyxLQUFLLElBQUksU0FBUyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQ3RHLFFBQVEsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUN0QixLQUFLLEtBQUssQ0FBQzt3QkFDWCxLQUFLLEtBQUssQ0FBQzt3QkFDWCxLQUFLLE9BQU8sQ0FBQzt3QkFDYixLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7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