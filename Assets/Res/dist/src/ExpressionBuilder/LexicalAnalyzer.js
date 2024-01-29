import { operators } from "./IOperator";
export var LexicalTokenType;
(function (LexicalTokenType) {
    LexicalTokenType[LexicalTokenType["Identifier"] = 0] = "Identifier";
    LexicalTokenType[LexicalTokenType["String"] = 1] = "String";
    LexicalTokenType[LexicalTokenType["StringTemplate"] = 2] = "StringTemplate";
    LexicalTokenType[LexicalTokenType["Number"] = 3] = "Number";
    LexicalTokenType[LexicalTokenType["Regexp"] = 4] = "Regexp";
    LexicalTokenType[LexicalTokenType["Keyword"] = 5] = "Keyword";
    LexicalTokenType[LexicalTokenType["Operator"] = 6] = "Operator";
    LexicalTokenType[LexicalTokenType["Block"] = 7] = "Block";
    LexicalTokenType[LexicalTokenType["Breaker"] = 8] = "Breaker";
})(LexicalTokenType || (LexicalTokenType = {}));
export class LexicalAnalyzer {
    static *parse(input) {
        const pointer = {
            index: -1
        };
        const length = input.length;
        pointer.index++;
        let char;
        let lastToken;
        do {
            char = input[pointer.index];
            if (char <= " ") {
                pointer.index++;
                continue;
            }
            else if ((char >= "A" && char <= "Z") || (char >= "a" && char <= "z")
                || char === "_" || char === "$") {
                lastToken = analyzeLexicalIdentifier(pointer, input);
                yield lastToken;
            }
            else if (char === "(" || char === "[" || char === "%"
                || (char !== "," && char >= "*" && char < "/") || (char >= "<" && char <= "?")
                || char === "&" || char === "|" || char === "~" || char === "^" || char === "!") {
                lastToken = analyzeLexicalOperator(pointer, input);
                yield lastToken;
            }
            else if (char === "'" || char === "\"") {
                lastToken = analyzeLexicalString(pointer, input);
                yield lastToken;
            }
            else if (char >= "0" && char <= "9") {
                lastToken = analyzeLexicalNumber(pointer, input);
                yield lastToken;
            }
            else if (char === "{") {
                lastToken = {
                    data: char,
                    type: LexicalTokenType.Block
                };
                yield lastToken;
                pointer.index++;
            }
            else if (char === "`") {
                lastToken = analyzeLexicalTemplateLiteral(pointer, input);
                yield lastToken;
            }
            else if ((["\n", ";", ",", ":", "}", "]", ")"]).indexOf(char) >= 0) {
                lastToken = {
                    data: char,
                    type: LexicalTokenType.Breaker
                };
                yield lastToken;
                pointer.index++;
            }
            else if (char === "/") {
                const char2 = input[pointer.index + 1];
                if (char2 === "*") {
                    analyzeLexicalComment(pointer, input, true);
                }
                else if (char2 === "/") {
                    analyzeLexicalComment(pointer, input, false);
                }
                else {
                    if (!lastToken || lastToken.type > LexicalTokenType.Regexp) {
                        lastToken = analyzeRegexp(pointer, input);
                        yield lastToken;
                    }
                    else {
                        lastToken = analyzeLexicalOperator(pointer, input);
                        yield lastToken;
                    }
                }
            }
        } while (pointer.index < length);
    }
}
const keywordOperators = operators.where((o) => o.identifier >= "a" && o.identifier <= "z" && o.identifier !== "function").select((o) => o.identifier);
keywordOperators.enableCache = true;
const keywords = ["abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "do", "double", "else", "enum", "eval", "export", "extends", "final", "finally", "for", "goto", "if", "implements", "import", "interface", "let", "long", "native", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "try", "var", "volatile", "while", "with"];
function analyzeLexicalIdentifier(pointer, input) {
    const start = pointer.index;
    let char;
    do {
        pointer.index++;
        char = input[pointer.index];
    } while ((char >= "A" && char <= "Z") || (char >= "a" && char <= "z") ||
        (char >= "0" && char <= "9") || char === "_" || char === "$");
    const data = input.slice(start, pointer.index);
    const type = keywordOperators.contains(data) ? LexicalTokenType.Operator :
        keywords.contains(data) ? LexicalTokenType.Keyword : LexicalTokenType.Identifier;
    return {
        data: data,
        type: type
    };
}
function analyzeLexicalString(pointer, input) {
    const stopper = input[pointer.index++];
    let data = "";
    for (;;) {
        const char = input[pointer.index++];
        if (char === "\\") {
            data += input[pointer.index++];
        }
        else if (char === stopper) {
            break;
        }
        else {
            data += char;
        }
    }
    return {
        data: data,
        type: LexicalTokenType.String
    };
}
function analyzeLexicalTemplateLiteral(pointer, input) {
    const res = analyzeLexicalString(pointer, input);
    res.type = LexicalTokenType.StringTemplate;
    return res;
}
function analyzeLexicalNumber(pointer, input) {
    const start = pointer.index;
    let char;
    do {
        pointer.index++;
        char = input[pointer.index];
    } while ((char >= "0" && char <= "9") || char === ".");
    const data = input.slice(start, pointer.index);
    return {
        data: data,
        type: LexicalTokenType.Number
    };
}
function analyzeRegexp(pointer, input) {
    const start = pointer.index;
    let isFoundEnd = false;
    let char;
    do {
        if (!isFoundEnd) {
            isFoundEnd = char === "/";
        }
        char = input[++pointer.index];
        if (char === "\\") {
            char = input[pointer.index += 2];
        }
    } while (!isFoundEnd || char === "i" || char === "g"
        || char === "m" || char === "u" || char === "y");
    const data = input.slice(start, pointer.index);
    return {
        data: data,
        type: LexicalTokenType.Regexp
    };
}
function analyzeLexicalComment(pointer, input, isBlock = false) {
    pointer.index += 2;
    let char;
    do {
        char = input[pointer.index++];
        if (isBlock) {
            if (char === "*") {
                char = input[pointer.index++];
                if (char === "/") {
                    break;
                }
            }
        }
        else if (char === "\n") {
            break;
        }
    } while (true);
}
function analyzeLexicalOperator(pointer, input) {
    const start = pointer.index;
    let char = input[pointer.index++];
    if (["(", "[", "?"].indexOf(char) < 0) {
        char = input[pointer.index];
        if (["=", ".", "+", "-", "*", "&", "|", ">", "<"].indexOf(char) >= 0) {
            char = input[++pointer.index];
            if (["=", ">", "."].indexOf(char) >= 0) {
                char = input[++pointer.index];
                if (char === "=") {
                    pointer.index++;
                }
            }
        }
    }
    const data = input.slice(start, pointer.index);
    return {
        type: LexicalTokenType.Operator,
        data: data
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGV4aWNhbEFuYWx5emVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRXhwcmVzc2lvbkJ1aWxkZXIvTGV4aWNhbEFuYWx5emVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFLeEMsTUFBTSxDQUFOLElBQVksZ0JBVVg7QUFWRCxXQUFZLGdCQUFnQjtJQUN4QixtRUFBVSxDQUFBO0lBQ1YsMkRBQU0sQ0FBQTtJQUNOLDJFQUFjLENBQUE7SUFDZCwyREFBTSxDQUFBO0lBQ04sMkRBQU0sQ0FBQTtJQUNOLDZEQUFPLENBQUE7SUFDUCwrREFBUSxDQUFBO0lBQ1IseURBQUssQ0FBQTtJQUNMLDZEQUFPLENBQUE7QUFDWCxDQUFDLEVBVlcsZ0JBQWdCLEtBQWhCLGdCQUFnQixRQVUzQjtBQUtELE1BQU0sT0FBTyxlQUFlO0lBQ2pCLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFhO1FBQzlCLE1BQU0sT0FBTyxHQUFvQjtZQUM3QixLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ1osQ0FBQztRQUNGLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDNUIsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLElBQUksSUFBWSxDQUFDO1FBQ2pCLElBQUksU0FBd0IsQ0FBQztRQUM3QixHQUFHLENBQUM7WUFDQSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU1QixJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDZCxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2hCLFNBQVM7WUFDYixDQUFDO2lCQUNJLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQzttQkFDOUQsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ2xDLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3JELE1BQU0sU0FBUyxDQUFDO1lBQ3BCLENBQUM7aUJBQ0ksSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxLQUFLLEdBQUc7bUJBQzlDLENBQUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQzttQkFDM0UsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ2xGLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sU0FBUyxDQUFDO1lBQ3BCLENBQUM7aUJBQ0ksSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDckMsU0FBUyxHQUFHLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDakQsTUFBTSxTQUFTLENBQUM7WUFDcEIsQ0FBQztpQkFDSSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNsQyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLFNBQVMsQ0FBQztZQUNwQixDQUFDO2lCQUNJLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixTQUFTLEdBQUc7b0JBQ1IsSUFBSSxFQUFFLElBQUk7b0JBQ1YsSUFBSSxFQUFFLGdCQUFnQixDQUFDLEtBQUs7aUJBQy9CLENBQUM7Z0JBQ0YsTUFBTSxTQUFTLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQixDQUFDO2lCQUNJLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixTQUFTLEdBQUcsNkJBQTZCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLFNBQVMsQ0FBQztZQUNwQixDQUFDO2lCQUNJLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNqRSxTQUFTLEdBQUc7b0JBQ1IsSUFBSSxFQUFFLElBQUk7b0JBQ1YsSUFBSSxFQUFFLGdCQUFnQixDQUFDLE9BQU87aUJBQ2pDLENBQUM7Z0JBQ0YsTUFBTSxTQUFTLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQixDQUFDO2lCQUNJLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxLQUFLLEtBQUssR0FBRyxFQUFFLENBQUM7b0JBQ2hCLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hELENBQUM7cUJBQ0ksSUFBSSxLQUFLLEtBQUssR0FBRyxFQUFFLENBQUM7b0JBQ3JCLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pELENBQUM7cUJBQ0ksQ0FBQztvQkFDRixJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ3pELFNBQVMsR0FBRyxhQUFhLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUMxQyxNQUFNLFNBQVMsQ0FBQztvQkFDcEIsQ0FBQzt5QkFDSSxDQUFDO3dCQUNGLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ25ELE1BQU0sU0FBUyxDQUFDO29CQUNwQixDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQyxRQUFRLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxFQUFFO0lBQ3JDLENBQUM7Q0FDSjtBQUVELE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLFVBQVUsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2SixnQkFBZ0IsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLE1BQU0sUUFBUSxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRXpmLFNBQVMsd0JBQXdCLENBQUMsT0FBd0IsRUFBRSxLQUFhO0lBQ3JFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDNUIsSUFBSSxJQUFZLENBQUM7SUFDakIsR0FBRyxDQUFDO1FBQ0EsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLENBQUMsUUFDRyxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDO1FBQzVELENBQUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFO0lBRWxFLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RFLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDO0lBRXJGLE9BQU87UUFDSCxJQUFJLEVBQUUsSUFBSTtRQUNWLElBQUksRUFBRSxJQUFJO0tBQ2IsQ0FBQztBQUNOLENBQUM7QUFDRCxTQUFTLG9CQUFvQixDQUFDLE9BQXdCLEVBQUUsS0FBYTtJQUNqRSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDdkMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsU0FBVSxDQUFDO1FBQ1AsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLElBQUksSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2hCLElBQUksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkMsQ0FBQzthQUNJLElBQUksSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO1lBQ3hCLE1BQU07UUFDVixDQUFDO2FBQ0ksQ0FBQztZQUNGLElBQUksSUFBSSxJQUFJLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPO1FBQ0gsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsZ0JBQWdCLENBQUMsTUFBTTtLQUNoQyxDQUFDO0FBQ04sQ0FBQztBQUNELFNBQVMsNkJBQTZCLENBQUMsT0FBd0IsRUFBRSxLQUFhO0lBQzFFLE1BQU0sR0FBRyxHQUFHLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNqRCxHQUFHLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDLGNBQWMsQ0FBQztJQUMzQyxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFDRCxTQUFTLG9CQUFvQixDQUFDLE9BQXdCLEVBQUUsS0FBYTtJQUNqRSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQzVCLElBQUksSUFBWSxDQUFDO0lBQ2pCLEdBQUcsQ0FBQztRQUNBLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFO0lBQ3ZELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxPQUFPO1FBQ0gsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsZ0JBQWdCLENBQUMsTUFBTTtLQUNoQyxDQUFDO0FBQ04sQ0FBQztBQUNELFNBQVMsYUFBYSxDQUFDLE9BQXdCLEVBQUUsS0FBYTtJQUMxRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQzVCLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztJQUN2QixJQUFJLElBQVksQ0FBQztJQUNqQixHQUFHLENBQUM7UUFDQSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxVQUFVLEdBQUcsSUFBSSxLQUFLLEdBQUcsQ0FBQztRQUM5QixDQUFDO1FBQ0QsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixJQUFJLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNoQixJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckMsQ0FBQztJQUNMLENBQUMsUUFDRyxDQUFDLFVBQVUsSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksS0FBSyxHQUFHO1dBQ3hDLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUNqRDtJQUNGLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxPQUFPO1FBQ0gsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsZ0JBQWdCLENBQUMsTUFBTTtLQUNoQyxDQUFDO0FBQ04sQ0FBQztBQUNELFNBQVMscUJBQXFCLENBQUMsT0FBd0IsRUFBRSxLQUFhLEVBQUUsT0FBTyxHQUFHLEtBQUs7SUFDbkYsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7SUFDbkIsSUFBSSxJQUFZLENBQUM7SUFDakIsR0FBRyxDQUFDO1FBQ0EsSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM5QixJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1YsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7b0JBQ2YsTUFBTTtnQkFDVixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7YUFDSSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNyQixNQUFNO1FBQ1YsQ0FBQztJQUNMLENBQUMsUUFBUSxJQUFJLEVBQUU7QUFDbkIsQ0FBQztBQUNELFNBQVMsc0JBQXNCLENBQUMsT0FBd0IsRUFBRSxLQUFhO0lBQ25FLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDNUIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNwQyxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkUsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3JDLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlCLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO29CQUNmLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDcEIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUNELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQyxPQUFPO1FBQ0gsSUFBSSxFQUFFLGdCQUFnQixDQUFDLFFBQVE7UUFDL0IsSUFBSSxFQUFFLElBQUk7S0FDYixDQUFDO0FBQ04sQ0FBQyJ9