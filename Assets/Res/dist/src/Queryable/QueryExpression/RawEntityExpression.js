import { hashCode } from "../../Helper/Util";
import { ColumnExpression } from "./ColumnExpression";
export class RawEntityExpression {
    constructor(type, schema, definingQuery, alias) {
        this.type = type;
        this.schema = schema;
        this.definingQuery = definingQuery;
        this.alias = alias;
        this.entityTypes = [this.type];
        this.defaultOrders = [];
        this.primaryColumns = [];
        this.columns = [];
        for (const prop in schema) {
            const valueType = schema[prop] || String;
            const columnExp = new ColumnExpression(this, valueType, prop, prop, false, true);
            this.columns.push(columnExp);
        }
    }
    get name() {
        return this.alias;
    }
    clone(replaceMap) {
        const clone = new RawEntityExpression(this.type, this.schema, this.definingQuery, this.alias);
        replaceMap.set(this, clone);
        return clone;
    }
    hashCode() {
        return hashCode(this.name);
    }
    toString() {
        return `Entity(${this.name}:${this.definingQuery})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF3RW50aXR5RXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1F1ZXJ5YWJsZS9RdWVyeUV4cHJlc3Npb24vUmF3RW50aXR5RXhwcmVzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHN0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFLdEQsTUFBTSxPQUFPLG1CQUFtQjtJQUM1QixZQUE0QixJQUFvQixFQUMxQixNQUEwRCxFQUNwRCxhQUFxQixFQUM5QixLQUFhO1FBSEosU0FBSSxHQUFKLElBQUksQ0FBZ0I7UUFDMUIsV0FBTSxHQUFOLE1BQU0sQ0FBb0Q7UUFDcEQsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFDOUIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxFQUFFLENBQUM7WUFDeEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQztZQUN6QyxNQUFNLFNBQVMsR0FBRyxJQUFJLGdCQUFnQixDQUFJLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakMsQ0FBQztJQUNMLENBQUM7SUFHRCxJQUFXLElBQUk7UUFDWCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUtNLEtBQUssQ0FBQyxVQUEwQztRQUNuRCxNQUFNLEtBQUssR0FBRyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5RixVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sVUFBVSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQztJQUN4RCxDQUFDO0NBQ0oifQ==