function toRegExp(pattern, escape = "\\") {
    let regexStr = "^";
    for (let i = 0, len = pattern.length; i < len; i++) {
        let char = pattern[i];
        switch (char) {
            case escape:
                char = pattern[++i];
                break;
            case "%":
                regexStr += ".*";
                continue;
            case "_":
                regexStr += ".";
                continue;
        }
        switch (char) {
            case "^":
            case "*":
            case ".":
            case "[":
            case "]":
            case "?":
            case "$":
            case "+":
            case "(":
            case ")":
            case "{":
            case "}":
            case "\\":
                regexStr += "\\" + char;
                break;
            default:
                regexStr += char;
        }
    }
    return new RegExp(regexStr + "$");
}
String.prototype.like = function (pattern, escape = "\\") {
    const regex = toRegExp(pattern || "", escape);
    return regex.test(this);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nRXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRXh0ZW5zaW9ucy9TdHJpbmdFeHRlbnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsU0FBUyxRQUFRLENBQUMsT0FBZSxFQUFFLFNBQWlCLElBQUk7SUFDcEQsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDO0lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNqRCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsUUFBUSxJQUFJLEVBQUUsQ0FBQztZQUNYLEtBQUssTUFBTTtnQkFDUCxJQUFJLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU07WUFDVixLQUFLLEdBQUc7Z0JBQ0osUUFBUSxJQUFJLElBQUksQ0FBQztnQkFDakIsU0FBUztZQUNiLEtBQUssR0FBRztnQkFDSixRQUFRLElBQUksR0FBRyxDQUFDO2dCQUNoQixTQUFTO1FBQ2pCLENBQUM7UUFDRCxRQUFRLElBQUksRUFBRSxDQUFDO1lBQ1gsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxJQUFJO2dCQUNMLFFBQVEsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUN4QixNQUFNO1lBQ1Y7Z0JBQ0ksUUFBUSxJQUFJLElBQUksQ0FBQztRQUN6QixDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8sSUFBSSxNQUFNLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxVQUF3QixPQUFlLEVBQUUsTUFBTSxHQUFHLElBQUk7SUFDMUUsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sSUFBSSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDOUMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLENBQUMsQ0FBQyJ9