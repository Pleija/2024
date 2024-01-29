import { hashCode } from "../../Helper/Util";
export class StringTemplateExpression {
    constructor(template) {
        this.template = template;
        this.type = String;
    }
    clone() {
        return this;
    }
    hashCode() {
        return hashCode(this.template, hashCode("`"));
    }
    toString() {
        return "`" + this.template + "`";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nVGVtcGxhdGVFeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0V4cHJlc3Npb25CdWlsZGVyL0V4cHJlc3Npb24vU3RyaW5nVGVtcGxhdGVFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUc3QyxNQUFNLE9BQU8sd0JBQXdCO0lBQ2pDLFlBQTRCLFFBQWdCO1FBQWhCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFDckMsU0FBSSxHQUFHLE1BQU0sQ0FBQztJQUQyQixDQUFDO0lBRTFDLEtBQUs7UUFDUixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztJQUNyQyxDQUFDO0NBQ0oifQ==