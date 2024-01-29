import { columnMetaKey, relationMetaKey } from "../../Decorator/DecoratorKey";
import { hashCode, resolveClone } from "../../Helper/Util";
export class MemberAccessExpression {
    get type() {
        if (!this._type) {
            if (this.objectOperand.type) {
                const objectType = this.objectOperand.type;
                const columnMeta = Reflect.getOwnMetadata(columnMetaKey, objectType, this.memberName);
                const relationMeta = Reflect.getOwnMetadata(relationMetaKey, objectType, this.memberName);
                if (columnMeta) {
                    this._type = columnMeta.type;
                }
                else if (relationMeta) {
                    if (relationMeta.relationType === "one") {
                        this._type = relationMeta.target.type;
                    }
                    else {
                        this._type = Array;
                        this.itemType = relationMeta.target.type;
                    }
                }
                else {
                    let memberValue = objectType.prototype[this.memberName];
                    if (!memberValue) {
                        try {
                            const objectInstance = new objectType();
                            memberValue = objectInstance[this.memberName];
                        }
                        catch (e) { }
                    }
                    if (memberValue) {
                        this._type = memberValue.constructor;
                    }
                }
            }
        }
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    constructor(objectOperand, memberName, type) {
        this.objectOperand = objectOperand;
        this.memberName = memberName;
        this._type = type;
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const objectOperand = resolveClone(this.objectOperand, replaceMap);
        const clone = new MemberAccessExpression(objectOperand, this.memberName);
        clone.type = this.type;
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCode("." + this.memberName, this.objectOperand.hashCode());
    }
    toString() {
        let result = this.objectOperand.toString();
        result += "." + this.memberName;
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVtYmVyQWNjZXNzRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0V4cHJlc3Npb25CdWlsZGVyL0V4cHJlc3Npb24vTWVtYmVyQWNjZXNzRXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlFLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFLM0QsTUFBTSxPQUFPLHNCQUFzQjtJQUMvQixJQUFXLElBQUk7UUFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMxQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQW1CLENBQUM7Z0JBQzFELE1BQU0sVUFBVSxHQUFtQixPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0RyxNQUFNLFlBQVksR0FBOEIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDckgsSUFBSSxVQUFVLEVBQUUsQ0FBQztvQkFDYixJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pDLENBQUM7cUJBQ0ksSUFBSSxZQUFZLEVBQUUsQ0FBQztvQkFDcEIsSUFBSSxZQUFZLENBQUMsWUFBWSxLQUFLLEtBQUssRUFBRSxDQUFDO3dCQUN0QyxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO29CQUMxQyxDQUFDO3lCQUNJLENBQUM7d0JBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFZLENBQUM7d0JBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQzdDLENBQUM7Z0JBQ0wsQ0FBQztxQkFDSSxDQUFDO29CQUNGLElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN4RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQ2YsSUFBSSxDQUFDOzRCQUNELE1BQU0sY0FBYyxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7NEJBQ3hDLFdBQVcsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUNsRCxDQUFDO3dCQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNuQixDQUFDO29CQUNELElBQUksV0FBVyxFQUFFLENBQUM7d0JBQ2QsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO29CQUN6QyxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBQ0QsSUFBVyxJQUFJLENBQUMsS0FBSztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBQ0QsWUFBbUIsYUFBOEIsRUFBUyxVQUFhLEVBQUUsSUFBcUI7UUFBM0Usa0JBQWEsR0FBYixhQUFhLENBQWlCO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBRztRQUNuRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBR00sS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNuRSxNQUFNLEtBQUssR0FBRyxJQUFJLHNCQUFzQixDQUFXLGFBQWEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkYsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFDTSxRQUFRO1FBQ1gsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQyxNQUFNLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDaEMsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUNKIn0=