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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGV4aWNhbEFuYWx5emVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0V4cHJlc3Npb25CdWlsZGVyL0xleGljYWxBbmFseXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBS3hDLE1BQU0sQ0FBTixJQUFZLGdCQVVYO0FBVkQsV0FBWSxnQkFBZ0I7SUFDeEIsbUVBQVUsQ0FBQTtJQUNWLDJEQUFNLENBQUE7SUFDTiwyRUFBYyxDQUFBO0lBQ2QsMkRBQU0sQ0FBQTtJQUNOLDJEQUFNLENBQUE7SUFDTiw2REFBTyxDQUFBO0lBQ1AsK0RBQVEsQ0FBQTtJQUNSLHlEQUFLLENBQUE7SUFDTCw2REFBTyxDQUFBO0FBQ1gsQ0FBQyxFQVZXLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFVM0I7QUFLRCxNQUFNLE9BQU8sZUFBZTtJQUNqQixNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBYTtRQUM5QixNQUFNLE9BQU8sR0FBb0I7WUFDN0IsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNaLENBQUM7UUFDRixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixJQUFJLElBQVksQ0FBQztRQUNqQixJQUFJLFNBQXdCLENBQUM7UUFDN0IsR0FBRyxDQUFDO1lBQ0EsSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFNUIsSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ2QsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNoQixTQUFTO1lBQ2IsQ0FBQztpQkFDSSxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUks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