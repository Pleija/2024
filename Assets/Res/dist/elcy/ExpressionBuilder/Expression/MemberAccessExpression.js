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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVtYmVyQWNjZXNzRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FeHByZXNzaW9uQnVpbGRlci9FeHByZXNzaW9uL01lbWJlckFjY2Vzc0V4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RSxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSzNELE1BQU0sT0FBTyxzQkFBc0I7SUFDL0IsSUFBVyxJQUFJO1FBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNkLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFtQixDQUFDO2dCQUMxRCxNQUFNLFVBQVUsR0FBbUIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEcsTUFBTSxZQUFZLEdBQThCLE9BQU8sQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3JILElBQUksVUFBVSxFQUFFLENBQUM7b0JBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUNqQyxDQUFDO3FCQUNJLElBQUksWUFBWSxFQUFFLENBQUM7b0JBQ3BCLElBQUksWUFBWSxDQUFDLFlBQVksS0FBSyxLQUFLLEVBQUUsQ0FBQzt3QkFDdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFDMUMsQ0FBQzt5QkFDSSxDQUFDO3dCQUNGLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBWSxDQUFDO3dCQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO29CQUM3QyxDQUFDO2dCQUNMLENBQUM7cUJBQ0ksQ0FBQztvQkFDRixJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDeEQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUNmLElBQUksQ0FBQzs0QkFDRCxNQUFNLGNBQWMsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOzRCQUN4QyxXQUFXLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDbEQsQ0FBQzt3QkFBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbkIsQ0FBQztvQkFDRCxJQUFJLFdBQVcsRUFBRSxDQUFDO3dCQUNkLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQztvQkFDekMsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUNELElBQVcsSUFBSSxDQUFDLEtBQUs7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUNELFlBQW1CLGFBQThCLEVBQVMsVUFBYSxFQUFFLElBQXFCO1FBQTNFLGtCQUFhLEdBQWIsYUFBYSxDQUFpQjtRQUFTLGVBQVUsR0FBVixVQUFVLENBQUc7UUFDbkUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUdNLEtBQUssQ0FBQyxVQUEwQztRQUNuRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbkUsTUFBTSxLQUFLLEdBQUcsSUFBSSxzQkFBc0IsQ0FBVyxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25GLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBQ00sUUFBUTtRQUNYLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0MsTUFBTSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ2hDLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSiJ9