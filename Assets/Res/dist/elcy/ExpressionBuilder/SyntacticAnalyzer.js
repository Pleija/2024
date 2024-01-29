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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3ludGFjdGljQW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRXhwcmVzc2lvbkJ1aWxkZXIvU3ludGFjdGljQW5hbHl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUUxRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDekUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDN0UsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFckUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDL0UsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDN0UsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDekUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDM0UsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDdkUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDakYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQWtELFNBQVMsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3BJLE9BQU8sRUFBaUIsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQVFwRSxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FB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