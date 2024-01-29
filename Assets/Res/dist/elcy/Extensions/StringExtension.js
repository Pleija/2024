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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nRXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0V4dGVuc2lvbnMvU3RyaW5nRXh0ZW5zaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLFNBQVMsUUFBUSxDQUFDLE9BQWUsRUFBRSxTQUFpQixJQUFJO0lBQ3BELElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQztJQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDakQsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLFFBQVEsSUFBSSxFQUFFLENBQUM7WUFDWCxLQUFLLE1BQU07Z0JBQ1AsSUFBSSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixNQUFNO1lBQ1YsS0FBSyxHQUFHO2dCQUNKLFFBQVEsSUFBSSxJQUFJLENBQUM7Z0JBQ2pCLFNBQVM7WUFDYixLQUFLLEdBQUc7Z0JBQ0osUUFBUSxJQUFJLEdBQUcsQ0FBQztnQkFDaEIsU0FBUztRQUNqQixDQUFDO1FBQ0QsUUFBUSxJQUFJLEVBQUUsQ0FBQztZQUNYLEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssR0FBRyxDQUFDO1lBQ1QsS0FBSyxHQUFHLENBQUM7WUFDVCxLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssSUFBSTtnQkFDTCxRQUFRLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDeEIsTUFBTTtZQUNWO2dCQUNJLFFBQVEsSUFBSSxJQUFJLENBQUM7UUFDekIsQ0FBQztJQUNMLENBQUM7SUFFRCxPQUFPLElBQUksTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsVUFBd0IsT0FBZSxFQUFFLE1BQU0sR0FBRyxJQUFJO0lBQzFFLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixDQUFDLENBQUMifQ==