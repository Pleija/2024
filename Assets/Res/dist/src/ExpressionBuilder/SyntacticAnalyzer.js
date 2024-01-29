import { NullConstructor } from "../Common/Constant";
import { ParameterStack } from "../Common/ParameterStack";
import { DbFunction } from "../Query/DbFunction";
import { ArrayValueExpression } from "./Expression/ArrayValueExpression";
import { FunctionCallExpression } from "./Expression/FunctionCallExpression";
import { FunctionExpression } from "./Expression/FunctionExpression";
import { InstantiationExpression } from "./Expression/InstantiationExpression";
import { MemberAccessExpression } from "./Expression/MemberAccessExpression";
import { MethodCallExpression } from "./Expression/MethodCallExpression";
import { ObjectValueExpression } from "./Expression/ObjectValueExpression";
import { ParameterExpression } from "./Expression/ParameterExpression";
import { StringTemplateExpression } from "./Expression/StringTemplateExpression";
import { ValueExpression } from "./Expression/ValueExpression";
import { Associativity, operators, OperatorType, UnaryPosition } from "./IOperator";
import { LexicalTokenType } from "./LexicalAnalyzer";
const globalObjectMaps = new Map([
    // Global Function
    ["parseInt", parseInt],
    ["parseFloat", parseFloat],
    ["decodeURI", decodeURI],
    ["decodeURIComponent", decodeURIComponent],
    ["encodeURI", encodeURI],
    ["encodeURIComponent", encodeURIComponent],
    ["isNaN", isNaN],
    ["isFinite", isFinite],
    ["eval", eval],
    // Fundamental Objects
    ["Object", Object],
    ["Function", Function],
    ["Boolean", Boolean],
    ["Symbol", Symbol],
    // Constructor/ Type
    ["Error", Error],
    ["Number", Number],
    ["Math", Math],
    ["Date", Date],
    ["String", String],
    ["RegExp", RegExp],
    ["Array", Array],
    ["Map", Map],
    ["Set", Set],
    ["WeakMap", WeakMap],
    ["WeakSet", WeakSet],
    ["ArrayBuffer", ArrayBuffer],
    ["Uint8Array", Uint8Array],
    ["Uint16Array", Uint16Array],
    ["Uint32Array", Uint32Array],
    ["Int8Array", Int8Array],
    ["Int16Array", Int16Array],
    ["Int32Array", Int32Array],
    ["Uint8ClampedArray", Uint8ClampedArray],
    ["Float32Array", Float32Array],
    ["Float64Array", Float64Array],
    ["DataView", DataView],
    // Value
    ["Infinity", Infinity],
    ["NaN", NaN],
    ["undefined", undefined],
    ["null", null],
    ["true", true],
    ["false", false],
    // Helper
    ["DbFunction", DbFunction]
]);
const prefixOperators = operators.where((o) => o.type === OperatorType.Unary && o.position === UnaryPosition.Prefix).toMap((o) => o.identifier);
const postfixOperators = operators.where((o) => o.type !== OperatorType.Unary || o.position === UnaryPosition.Postfix).toMap((o) => o.identifier);
export class SyntacticAnalyzer {
    static parse(tokens, paramTypes, userParameters) {
        if (!userParameters) {
            userParameters = new ParameterStack();
        }
        if (!paramTypes) {
            paramTypes = [];
        }
        const param = {
            index: 0,
            paramTypes: paramTypes,
            scopedParameters: new Map(),
            userParameters: userParameters
        };
        const result = createExpression(param, tokens);
        return result;
    }
}
function isGreatherThan(precedence1, precedence2) {
    if (precedence1.precedence === precedence2.precedence) {
        if (precedence1.associativity === Associativity.None) {
            return false;
        }
        else if (precedence2.associativity === Associativity.None) {
            return true;
        }
        return precedence1.associativity === Associativity.Left;
    }
    return precedence1.precedence >= precedence2.precedence;
}
function createExpression(param, tokens, expression, prevOperator) {
    while (param.index < tokens.length) {
        const token = tokens[param.index];
        switch (token.type) {
            case LexicalTokenType.Operator: {
                if (token.data === "=>") {
                    param.index++;
                    expression = createFunctionExpression(param, expression, tokens);
                }
                else {
                    const operator = (!expression ? prefixOperators : postfixOperators).get(token.data);
                    if (!operator || (prevOperator && isGreatherThan(prevOperator.precedence, operator.precedence))) {
                        return expression;
                    }
                    param.index++;
                    switch (operator.type) {
                        case OperatorType.Unary: {
                            const unaryOperator = operator;
                            if (unaryOperator.position === UnaryPosition.Postfix) {
                                expression = operator.expressionFactory(expression);
                            }
                            else {
                                switch (operator.identifier) {
                                    case "new": {
                                        const typeExp = createExpression(param, tokens, null, operator);
                                        const paramToken = tokens[param.index];
                                        let params = [];
                                        if (paramToken.type === LexicalTokenType.Operator && paramToken.data === "(") {
                                            param.index++;
                                            const exp = createParamExpression(param, tokens, ")");
                                            params = exp.items;
                                        }
                                        expression = new InstantiationExpression(typeExp, params);
                                        break;
                                    }
                                    case "[": {
                                        if (!expression) {
                                            expression = createArrayExpression(param, tokens);
                                            break;
                                        }
                                        else {
                                            throw new Error("expression not supported");
                                        }
                                    }
                                    case "(": {
                                        if (expression) {
                                            throw new Error("expression not supported");
                                        }
                                        const arrayExp = createParamExpression(param, tokens, ")");
                                        if (arrayExp.items.length === 1) {
                                            expression = arrayExp.items[0];
                                        }
                                        else {
                                            expression = arrayExp;
                                        }
                                        break;
                                    }
                                    default: {
                                        const operand = createExpression(param, tokens, undefined, operator);
                                        expression = operator.expressionFactory(operand);
                                    }
                                }
                            }
                            break;
                        }
                        case OperatorType.Binary: {
                            if (operator.identifier === "(") {
                                const params = createParamExpression(param, tokens, ")");
                                if (expression instanceof MemberAccessExpression) {
                                    expression = new MethodCallExpression(expression.objectOperand, expression.memberName, params.items);
                                }
                                else {
                                    expression = new FunctionCallExpression(expression, params.items);
                                }
                                continue;
                            }
                            const operand = createExpression(param, tokens, undefined, operator);
                            if (operator.identifier === ".") {
                                const memberName = operand.toString();
                                expression = new MemberAccessExpression(expression, memberName);
                            }
                            else {
                                expression = operator.expressionFactory(expression, operand);
                            }
                            break;
                        }
                        case OperatorType.Ternary: {
                            const operand = createExpression(param, tokens);
                            param.index++;
                            const operand2 = createExpression(param, tokens);
                            expression = operator.expressionFactory(expression, operand, operand2);
                            break;
                        }
                    }
                    continue;
                }
                break;
            }
            case LexicalTokenType.Block: {
                param.index++;
                if (!expression) {
                    return createObjectExpression(param, tokens);
                }
                else {
                    throw new Error("expression not supported");
                }
            }
            case LexicalTokenType.Breaker: {
                return expression;
            }
            case LexicalTokenType.Keyword: {
                param.index++;
                return createKeywordExpression(param, token, tokens);
            }
            case LexicalTokenType.Number: {
                expression = new ValueExpression(Number.parseFloat(token.data));
                param.index++;
                break;
            }
            case LexicalTokenType.String: {
                expression = new ValueExpression(token.data);
                param.index++;
                break;
            }
            case LexicalTokenType.StringTemplate: {
                expression = new StringTemplateExpression(token.data);
                param.index++;
                break;
            }
            case LexicalTokenType.Regexp: {
                const dataStr = token.data;
                const last = dataStr.lastIndexOf("/");
                expression = new ValueExpression(new RegExp(dataStr.substring(1, last), dataStr.substring(last + 1)), dataStr);
                param.index++;
                break;
            }
            case LexicalTokenType.Identifier: {
                expression = createIdentifierExpression(param, token, tokens);
                param.index++;
                break;
            }
            default: {
                param.index++;
            }
        }
    }
    return expression;
}
function createArrayExpression(param, tokens) {
    const arrayVal = [];
    while (param.index < tokens.length && (tokens[param.index].data !== "]")) {
        arrayVal.push(createExpression(param, tokens));
        if (tokens[param.index].data === ",") {
            param.index++;
        }
    }
    param.index++;
    return new ArrayValueExpression(...arrayVal);
}
function createObjectExpression(param, tokens) {
    const obj = {};
    while (param.index < tokens.length && (tokens[param.index].data !== "}")) {
        const propName = tokens[param.index].data;
        if (tokens[param.index + 1].data === ":") {
            param.index += 2;
        }
        const value = createExpression(param, tokens);
        obj[propName] = value;
        if (tokens[param.index].data === ",") {
            param.index++;
        }
    }
    param.index++;
    return new ObjectValueExpression(obj);
}
function createParamExpression(param, tokens, stopper) {
    const arrayVal = [];
    while (param.index < tokens.length && (tokens[param.index].data !== stopper)) {
        arrayVal.push(createExpression(param, tokens));
        if (tokens[param.index].data === ",") {
            param.index++;
        }
    }
    param.index++;
    return new ArrayValueExpression(...arrayVal);
}
function createIdentifierExpression(param, token, tokens) {
    if (typeof token.data === "string" && param.scopedParameters.has(token.data)) {
        const params = param.scopedParameters.get(token.data);
        if (params.length > 0) {
            return params[0];
        }
    }
    let data = param.userParameters.get(token.data);
    if (data) {
        return new ParameterExpression(token.data, getConstructor(data));
    }
    else if (globalObjectMaps.has(token.data)) {
        data = globalObjectMaps.get(token.data);
        return new ValueExpression(data, token.data);
    }
    const type = param.paramTypes.shift();
    return new ParameterExpression(token.data, type);
}
function getConstructor(data) {
    if (data) {
        let constructor = data.constructor;
        if (constructor === Object) {
            // tslint:disable-next-line: no-empty
            constructor = function Object() { };
            constructor.prototype = data;
        }
        return constructor;
    }
    return NullConstructor;
}
function createKeywordExpression(param, token, tokens) {
    throw new Error(`keyword ${token.data} not supported`);
}
function createFunctionExpression(param, expression, tokens) {
    const params = expression instanceof ArrayValueExpression ? expression.items : expression ? [expression] : [];
    const token = tokens[param.index];
    for (const paramExp of params) {
        let paramsL = param.scopedParameters.get(paramExp.name);
        if (!paramsL) {
            paramsL = [];
            param.scopedParameters.set(paramExp.name, paramsL);
        }
        paramsL.unshift(paramExp);
    }
    let body;
    if (token.type === LexicalTokenType.Block) {
        param.index += 2;
    }
    body = createExpression(param, tokens);
    for (const paramExp of params) {
        const paramsL = param.scopedParameters.get(paramExp.name);
        paramsL.shift();
    }
    return new FunctionExpression(body, params);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3ludGFjdGljQW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9FeHByZXNzaW9uQnVpbGRlci9TeW50YWN0aWNBbmFseXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDckQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRTFELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVyRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUMvRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN2RSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUNqRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGFBQWEsRUFBa0QsU0FBUyxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDcEksT0FBTyxFQUFpQixnQkFBZ0IsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBUXBFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFH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