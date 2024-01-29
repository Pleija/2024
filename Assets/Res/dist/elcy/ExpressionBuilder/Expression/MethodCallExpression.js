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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0aG9kQ2FsbEV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9NZXRob2RDYWxsRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDekQsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDeEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBSXRELE1BQU0sT0FBTyxvQkFBb0I7SUFDN0IsSUFBVyxRQUFRO1FBQ2YsSUFBSyxJQUFJLENBQUMsSUFBWSxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQy9CLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7UUFDdkMsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxJQUFXLElBQUk7UUFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQztnQkFDRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQVcsQ0FBQztnQkFDbEQsSUFBSSxVQUFVLEtBQUssS0FBSyxJQUFJLFNBQVMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO29CQUN0RyxRQUFRLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzt3QkFDdEIsS0FBSyxLQUFLLENBQUM7d0JBQ1gsS0FBSyxLQUFLLENBQUM7d0JBQ1gsS0FBSyxPQUFPLENBQUM7d0JBQ2IsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFD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