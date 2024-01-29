import { operators } from "./IOperator";

interface ILexicalPointer {
    index: number;
}
export enum LexicalTokenType {
    Identifier,
    String,
    StringTemplate,
    Number,
    Regexp,
    Keyword,
    Operator,
    Block,
    Breaker
}
export interface ILexicalToken {
    data: string | number;
    type: LexicalTokenType;
}
export class LexicalAnalyzer {
    public static *parse(input: string): IterableIterator<ILexicalToken> {
        const pointer: ILexicalPointer = {
            index: -1
        };
        const length = input.length;
        pointer.index++;
        let char: string;
        let lastToken: ILexicalToken;
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

function analyzeLexicalIdentifier(pointer: ILexicalPointer, input: string): ILexicalToken {
    const start = pointer.index;
    let char: string;
    do {
        pointer.index++;
        char = input[pointer.index];
    } while (
        (char >= "A" && char <= "Z") || (char >= "a" && char <= "z") ||
        (char >= "0" && char <= "9") || char === "_" || char === "$");

    const data = input.slice(start, pointer.index);
    const type = keywordOperators.contains(data) ? LexicalTokenType.Operator :
        keywords.contains(data) ? LexicalTokenType.Keyword : LexicalTokenType.Identifier;

    return {
        data: data,
        type: type
    };
}
function analyzeLexicalString(pointer: ILexicalPointer, input: string): ILexicalToken {
    const stopper = input[pointer.index++];
    let data = "";
    for (; ;) {
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
function analyzeLexicalTemplateLiteral(pointer: ILexicalPointer, input: string): ILexicalToken {
    const res = analyzeLexicalString(pointer, input);
    res.type = LexicalTokenType.StringTemplate;
    return res;
}
function analyzeLexicalNumber(pointer: ILexicalPointer, input: string): ILexicalToken {
    const start = pointer.index;
    let char: string;
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
function analyzeRegexp(pointer: ILexicalPointer, input: string): ILexicalToken {
    const start = pointer.index;
    let isFoundEnd = false;
    let char: string;
    do {
        if (!isFoundEnd) {
            isFoundEnd = char === "/";
        }
        char = input[++pointer.index];
        if (char === "\\") {
            char = input[pointer.index += 2];
        }
    } while (
        !isFoundEnd || char === "i" || char === "g"
        || char === "m" || char === "u" || char === "y"
    );
    const data = input.slice(start, pointer.index);
    return {
        data: data,
        type: LexicalTokenType.Regexp
    };
}
function analyzeLexicalComment(pointer: ILexicalPointer, input: string, isBlock = false) {
    pointer.index += 2;
    let char: string;
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
function analyzeLexicalOperator(pointer: ILexicalPointer, input: string): ILexicalToken {
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
