import { hashCode } from "../../Helper/Util";
export class ParameterExpression {
    constructor(name, type, index) {
        this.name = name;
        this.index = index;
        this.type = type;
    }
    clone(replaceMap) {
        return this;
    }
    hashCode() {
        return this.type ? hashCode(this.type.name) : 27;
    }
    toString() {
        return this.name;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyYW1ldGVyRXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FeHByZXNzaW9uQnVpbGRlci9FeHByZXNzaW9uL1BhcmFtZXRlckV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzdDLE1BQU0sT0FBTyxtQkFBbUI7SUFDNUIsWUFBbUIsSUFBWSxFQUFFLElBQXFCLEVBQVMsS0FBYztRQUExRCxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQWdDLFVBQUssR0FBTCxLQUFLLENBQVM7UUFDekUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUdNLEtBQUssQ0FBQyxVQUEwQztRQUNuRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0NBQ0oifQ==