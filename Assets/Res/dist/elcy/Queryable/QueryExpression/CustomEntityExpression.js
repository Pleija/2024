import { hashCode, resolveClone } from "../../Helper/Util";
export class CustomEntityExpression {
    get primaryColumns() {
        if (!this._primaryColumns) {
            this._primaryColumns = this.columns.where((o) => o.isPrimary).toArray();
        }
        return this._primaryColumns;
    }
    constructor(name, columns, type, alias, defaultOrders = []) {
        this.name = name;
        this.type = type;
        this.alias = alias;
        this.defaultOrders = defaultOrders;
        this.entityTypes = [];
        this.columns = columns.select((o) => {
            const clone = o.clone();
            clone.entity = this;
            if (clone.alias) {
                clone.columnName = clone.alias;
                clone.alias = null;
            }
            return clone;
        }).toArray();
    }
    clone(replaceMap) {
        if (!replaceMap) {
            replaceMap = new Map();
        }
        const clone = new CustomEntityExpression(this.name, [], this.type, this.alias);
        replaceMap.set(this, clone);
        clone.columns = this.columns.select((o) => resolveClone(o, replaceMap)).toArray();
        return clone;
    }
    hashCode() {
        return hashCode(this.name, hashCode(this.type.name, this.columns.length));
    }
    toString() {
        return `CustomEntity(${this.name})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VzdG9tRW50aXR5RXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9RdWVyeWFibGUvUXVlcnlFeHByZXNzaW9uL0N1c3RvbUVudGl0eUV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQU0zRCxNQUFNLE9BQU8sc0JBQXNCO0lBQy9CLElBQVcsY0FBYztRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1RSxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ2hDLENBQUM7SUFDRCxZQUFtQixJQUFZLEVBQUUsT0FBNEIsRUFBa0IsSUFBb0IsRUFBUyxLQUFhLEVBQVMsZ0JBQXlDLEVBQUU7UUFBMUosU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFnRCxTQUFJLEdBQUosSUFBSSxDQUFnQjtRQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxrQkFBYSxHQUFiLGFBQWEsQ0FBOEI7UUFZdEssZ0JBQVcsR0FBa0IsRUFBRSxDQUFDO1FBWG5DLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2hDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN4QixLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDZCxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQy9CLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBTU0sS0FBSyxDQUFDLFVBQTBDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9FLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVCLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsRixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sZ0JBQWdCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQztJQUN4QyxDQUFDO0NBQ0oifQ==