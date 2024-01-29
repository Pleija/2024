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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nVGVtcGxhdGVFeHByZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbi9TdHJpbmdUZW1wbGF0ZUV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzdDLE1BQU0sT0FBTyx3QkFBd0I7SUFDakMsWUFBNEIsUUFBZ0I7UUFBaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUNyQyxTQUFJLEdBQUcsTUFBTSxDQUFDO0lBRDJCLENBQUM7SUFFMUMsS0FBSztRQUNSLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO0lBQ3JDLENBQUM7Q0FDSiJ9