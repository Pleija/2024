import { ParameterStack } from "../Common/ParameterStack";
import { SqlParameterExpression } from "../Queryable/QueryExpression/SqlParameterExpression";
import { SqlTableValueParameterExpression } from "../Queryable/QueryExpression/SqlTableValueParameterExpression";
import { AdditionAssignmentExpression } from "./Expression/AdditionAssignmentExpression";
import { AdditionExpression } from "./Expression/AdditionExpression";
import { AndExpression } from "./Expression/AndExpression";
import { ArrayValueExpression } from "./Expression/ArrayValueExpression";
import { AssignmentExpression } from "./Expression/AssignmentExpression";
import { BitwiseAndAssignmentExpression } from "./Expression/BitwiseAndAssignmentExpression";
import { BitwiseAndExpression } from "./Expression/BitwiseAndExpression";
import { BitwiseNotExpression } from "./Expression/BitwiseNotExpression";
import { BitwiseOrAssignmentExpression } from "./Expression/BitwiseOrAssignmentExpression";
import { BitwiseOrExpression } from "./Expression/BitwiseOrExpression";
import { BitwiseSignedRightShiftAssignmentExpression } from "./Expression/BitwiseSignedRightShiftAssignmentExpression";
import { BitwiseSignedRightShiftExpression } from "./Expression/BitwiseSignedRightShiftExpression";
import { BitwiseXorAssignmentExpression } from "./Expression/BitwiseXorAssignmentExpression";
import { BitwiseXorExpression } from "./Expression/BitwiseXorExpression";
import { BitwiseZeroLeftShiftAssignmentExpression } from "./Expression/BitwiseZeroLeftShiftAssignmentExpression";
import { BitwiseZeroLeftShiftExpression } from "./Expression/BitwiseZeroLeftShiftExpression";
import { BitwiseZeroRightShiftAssignmentExpression } from "./Expression/BitwiseZeroRightShiftAssignmentExpression";
import { BitwiseZeroRightShiftExpression } from "./Expression/BitwiseZeroRightShiftExpression";
import { DivisionAssignmentExpression } from "./Expression/DivisionAssignmentExpression";
import { DivisionExpression } from "./Expression/DivisionExpression";
import { EqualExpression } from "./Expression/EqualExpression";
import { ExponentiationAssignmentExpression } from "./Expression/ExponentiationAssignmentExpression";
import { ExponentiationExpression } from "./Expression/ExponentiationExpression";
import { FunctionCallExpression } from "./Expression/FunctionCallExpression";
import { FunctionExpression } from "./Expression/FunctionExpression";
import { GreaterEqualExpression } from "./Expression/GreaterEqualExpression";
import { GreaterThanExpression } from "./Expression/GreaterThanExpression";
import { InstanceofExpression } from "./Expression/InstanceofExpression";
import { InstantiationExpression } from "./Expression/InstantiationExpression";
import { LeftDecrementExpression } from "./Expression/LeftDecrementExpression";
import { LeftIncrementExpression } from "./Expression/LeftIncrementExpression";
import { LessEqualExpression } from "./Expression/LessEqualExpression";
import { LessThanExpression } from "./Expression/LessThanExpression";
import { MemberAccessExpression } from "./Expression/MemberAccessExpression";
import { MethodCallExpression } from "./Expression/MethodCallExpression";
import { ModulusAssignmentExpression } from "./Expression/ModulusAssignmentExpression";
import { ModulusExpression } from "./Expression/ModulusExpression";
import { MultiplicationAssignmentExpression } from "./Expression/MultiplicationAssignmentExpression";
import { MultiplicationExpression } from "./Expression/MultiplicationExpression";
import { NegationExpression } from "./Expression/NegationExpression";
import { NotEqualExpression } from "./Expression/NotEqualExpression";
import { NotExpression } from "./Expression/NotExpression";
import { ObjectValueExpression } from "./Expression/ObjectValueExpression";
import { OrExpression } from "./Expression/OrExpression";
import { ParameterExpression } from "./Expression/ParameterExpression";
import { RightDecrementExpression } from "./Expression/RightDecrementExpression";
import { RightIncrementExpression } from "./Expression/RightIncrementExpression";
import { StrictEqualExpression } from "./Expression/StrictEqualExpression";
import { StrictNotEqualExpression } from "./Expression/StrictNotEqualExpression";
import { StringTemplateExpression } from "./Expression/StringTemplateExpression";
import { SubstractionAssignmentExpression } from "./Expression/SubstractionAssignmentExpression";
import { SubstractionExpression } from "./Expression/SubstractionExpression";
import { TernaryExpression } from "./Expression/TernaryExpression";
import { TypeofExpression } from "./Expression/TypeofExpression";
import { ValueExpression } from "./Expression/ValueExpression";
import { ExpressionBuilder } from "./ExpressionBuilder";
export class ExpressionExecutor {
    constructor(params) {
        if (params instanceof ParameterStack) {
            this.stack = params;
        }
        else {
            this.stack = new ParameterStack();
            if (params) {
                this.setParameters(params);
            }
        }
    }
    static execute(expression) {
        return new ExpressionExecutor().execute(expression);
    }
    // TODO: SQLParameterExpression
    execute(expression) {
        switch (expression.constructor) {
            case AdditionAssignmentExpression:
                return this.executeAdditionAssignment(expression);
            case AdditionExpression:
                return this.executeAddition(expression);
            case AndExpression:
                return this.executeAnd(expression);
            case ArrayValueExpression:
                return this.executeArrayValue(expression);
            case AssignmentExpression:
                return this.executeAssignment(expression);
            case BitwiseAndAssignmentExpression:
                return this.executeBitwiseAndAssignment(expression);
            case BitwiseAndExpression:
                return this.executeBitwiseAnd(expression);
            case BitwiseNotExpression:
                return this.executeBitwiseNot(expression);
            case BitwiseOrAssignmentExpression:
                return this.executeBitwiseOrAssignment(expression);
            case BitwiseOrExpression:
                return this.executeBitwiseOr(expression);
            case BitwiseSignedRightShiftAssignmentExpression:
                return this.executeBitwiseSignedRightShiftAssignment(expression);
            case BitwiseSignedRightShiftExpression:
                return this.executeBitwiseSignedRightShift(expression);
            case BitwiseXorAssignmentExpression:
                return this.executeBitwiseXorAssignment(expression);
            case BitwiseXorExpression:
                return this.executeBitwiseXor(expression);
            case BitwiseZeroLeftShiftAssignmentExpression:
                return this.executeBitwiseZeroLeftShiftAssignment(expression);
            case BitwiseZeroLeftShiftExpression:
                return this.executeBitwiseZeroLeftShift(expression);
            case BitwiseZeroRightShiftAssignmentExpression:
                return this.executeBitwiseZeroRightShiftAssignment(expression);
            case BitwiseZeroRightShiftExpression:
                return this.executeBitwiseZeroRightShift(expression);
            case DivisionAssignmentExpression:
                return this.executeDivisionAssignment(expression);
            case DivisionExpression:
                return this.executeDivision(expression);
            case EqualExpression:
                return this.executeEqual(expression);
            case ExponentiationAssignmentExpression:
                return this.executeExponentialAssignment(expression);
            case ExponentiationExpression:
                return this.executeExponential(expression);
            case FunctionCallExpression:
                return this.executeFunctionCall(expression);
            case FunctionExpression:
                return this.executeFunction(expression, []);
            case GreaterEqualExpression:
                return this.executeGreaterEqual(expression);
            case GreaterThanExpression:
                return this.executeGreaterThan(expression);
            case InstanceofExpression:
                return this.executeInstanceof(expression);
            case InstantiationExpression:
                return this.executeInstantiation(expression);
            case LeftDecrementExpression:
                return this.executeLeftDecrement(expression);
            case LeftIncrementExpression:
                return this.executeLeftIncrement(expression);
            case LessEqualExpression:
                return this.executeLessEqual(expression);
            case LessThanExpression:
                return this.executeLessThan(expression);
            case MemberAccessExpression:
                return this.executeMemberAccess(expression);
            case MethodCallExpression:
                return this.executeMethodCall(expression);
            case ModulusAssignmentExpression:
                return this.executeModulusAssignment(expression);
            case ModulusExpression:
                return this.executeModulus(expression);
            case MultiplicationAssignmentExpression:
                return this.executeMultiplicationAssignment(expression);
            case MultiplicationExpression:
                return this.executeMultiplication(expression);
            case NegationExpression:
                return this.executeNegation(expression);
            case NotEqualExpression:
                return this.executeNotEqual(expression);
            case NotExpression:
                return this.executeNot(expression);
            case ObjectValueExpression:
                return this.executeObjectValue(expression);
            case OrExpression:
                return this.executeOr(expression);
            case ParameterExpression:
                return this.executeParameter(expression);
            case SqlTableValueParameterExpression:
            case SqlParameterExpression:
                return this.executeSqlParameter(expression);
            case RightDecrementExpression:
                return this.executeRightDecrement(expression);
            case RightIncrementExpression:
                return this.executeRightIncrement(expression);
            case StrictEqualExpression:
                return this.executeStrictEqual(expression);
            case StrictNotEqualExpression:
                return this.executeStrictNotEqual(expression);
            case SubstractionAssignmentExpression:
                return this.executeSubstractionAssignment(expression);
            case SubstractionExpression:
                return this.executeSubstraction(expression);
            case TernaryExpression:
                return this.executeTernary(expression);
            case TypeofExpression:
                return this.executeTypeof(expression);
            case ValueExpression:
                return this.executeValue(expression);
            case StringTemplateExpression:
                return this.executeStringTemplate(expression);
            default:
                throw new Error(`expression "${expression.toString()}" not supported`);
        }
    }
    executeFunction(expression, parameters) {
        let i = 0;
        for (const param of expression.params) {
            if (parameters.length > i) {
                this.stack.push(param.name, parameters[i++]);
            }
        }
        const result = this.execute(expression.body);
        i = 0;
        for (const param of expression.params) {
            if (parameters.length > i++) {
                this.stack.pop(param.name);
            }
        }
        return result;
    }
    setParameters(params) {
        this.stack.set(params);
    }
    toString(expression) {
        return expression.toString();
    }
    executeAddition(expression) {
        return this.execute(expression.leftOperand) + this.execute(expression.rightOperand);
    }
    executeAdditionAssignment(expression) {
        const value = this.execute(expression.leftOperand) + this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeAnd(expression) {
        return this.execute(expression.leftOperand) && this.execute(expression.rightOperand);
    }
    executeArrayValue(expression) {
        const result = [];
        for (const item of expression.items) {
            result.push(this.execute(item));
        }
        return result;
    }
    executeAssignment(expression) {
        const value = this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeBitwiseAnd(expression) {
        return this.execute(expression.leftOperand) & this.execute(expression.rightOperand);
    }
    executeBitwiseAndAssignment(expression) {
        const value = this.execute(expression.leftOperand) & this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeBitwiseNot(expression) {
        return ~this.execute(expression.operand);
    }
    executeBitwiseOr(expression) {
        return this.execute(expression.leftOperand) | this.execute(expression.rightOperand);
    }
    executeBitwiseOrAssignment(expression) {
        const value = this.execute(expression.leftOperand) | this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeBitwiseSignedRightShift(expression) {
        return this.execute(expression.leftOperand) >>> this.execute(expression.rightOperand);
    }
    executeBitwiseSignedRightShiftAssignment(expression) {
        const value = this.execute(expression.leftOperand) >>> this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeBitwiseXor(expression) {
        return this.execute(expression.leftOperand) ^ this.execute(expression.rightOperand);
    }
    executeBitwiseXorAssignment(expression) {
        const value = this.execute(expression.leftOperand) ^ this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeBitwiseZeroLeftShift(expression) {
        return this.execute(expression.leftOperand) << this.execute(expression.rightOperand);
    }
    executeBitwiseZeroLeftShiftAssignment(expression) {
        const value = this.execute(expression.leftOperand) << this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeBitwiseZeroRightShift(expression) {
        return this.execute(expression.leftOperand) >> this.execute(expression.rightOperand);
    }
    executeBitwiseZeroRightShiftAssignment(expression) {
        const value = this.execute(expression.leftOperand) >> this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeDivision(expression) {
        return this.execute(expression.leftOperand) / this.execute(expression.rightOperand);
    }
    executeDivisionAssignment(expression) {
        const value = this.execute(expression.leftOperand) / this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeEqual(expression) {
        // tslint:disable-next-line:triple-equals
        return this.execute(expression.leftOperand) == this.execute(expression.rightOperand);
    }
    executeExponential(expression) {
        return this.execute(expression.leftOperand) ** this.execute(expression.rightOperand);
    }
    executeExponentialAssignment(expression) {
        const value = this.execute(expression.leftOperand) ** this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeFunctionCall(expression) {
        const params = [];
        for (const param of expression.params) {
            params.push(this.execute(param));
        }
        const fn = this.execute(expression.fnExpression);
        return fn.apply(null, params);
    }
    executeGreaterEqual(expression) {
        return this.execute(expression.leftOperand) >= this.execute(expression.rightOperand);
    }
    executeGreaterThan(expression) {
        return this.execute(expression.leftOperand) > this.execute(expression.rightOperand);
    }
    executeInstanceof(expression) {
        return this.execute(expression.leftOperand) instanceof this.execute(expression.rightOperand);
    }
    executeInstantiation(expression) {
        const params = [];
        for (const param of expression.params) {
            params.push(this.execute(param));
        }
        const type = this.execute(expression.typeOperand);
        return new type(...params);
    }
    executeLeftDecrement(expression) {
        const value = this.executeParameter(expression.operand) - 1;
        this.stack.pop(expression.operand.name);
        this.stack.push(expression.operand.name, value);
        return value;
    }
    executeLeftIncrement(expression) {
        const value = this.executeParameter(expression.operand) + 1;
        this.stack.pop(expression.operand.name);
        this.stack.push(expression.operand.name, value);
        return value;
    }
    executeLessEqual(expression) {
        return this.execute(expression.leftOperand) <= this.execute(expression.rightOperand);
    }
    executeLessThan(expression) {
        return this.execute(expression.leftOperand) < this.execute(expression.rightOperand);
    }
    executeMemberAccess(expression) {
        return this.execute(expression.objectOperand)[expression.memberName];
    }
    executeMethodCall(expression) {
        const params = [];
        for (const param of expression.params) {
            params.push(this.execute(param));
        }
        const obj = this.execute(expression.objectOperand);
        const method = obj[expression.methodName];
        return method.apply(obj, params);
    }
    executeModulus(expression) {
        return this.execute(expression.leftOperand) % this.execute(expression.rightOperand);
    }
    executeModulusAssignment(expression) {
        const value = this.execute(expression.leftOperand) % this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeMultiplication(expression) {
        return this.execute(expression.leftOperand) * this.execute(expression.rightOperand);
    }
    executeMultiplicationAssignment(expression) {
        const value = this.execute(expression.leftOperand) * this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeNegation(expression) {
        return -this.execute(expression.operand);
    }
    executeNot(expression) {
        return !this.execute(expression.operand);
    }
    executeNotEqual(expression) {
        // tslint:disable-next-line:triple-equals
        return this.execute(expression.leftOperand) != this.execute(expression.rightOperand);
    }
    executeObjectValue(expression) {
        const result = new expression.type();
        for (const key in expression.object) {
            result[key] = this.execute(expression.object[key]);
        }
        return result;
    }
    executeOr(expression) {
        return this.execute(expression.leftOperand) || this.execute(expression.rightOperand);
    }
    executeParameter(expression) {
        return this.stack.get(expression.name, expression.index);
    }
    executeRightDecrement(expression) {
        const value = this.executeParameter(expression.operand);
        this.stack.pop(expression.operand.name);
        this.stack.push(expression.operand.name, value - 1);
        return value;
    }
    executeRightIncrement(expression) {
        const value = this.executeParameter(expression.operand);
        this.stack.pop(expression.operand.name);
        this.stack.push(expression.operand.name, value + 1);
        return value;
    }
    executeSqlParameter(expression) {
        return this.execute(expression.valueExp);
    }
    executeStrictEqual(expression) {
        return this.execute(expression.leftOperand) === this.execute(expression.rightOperand);
    }
    executeStrictNotEqual(expression) {
        return this.execute(expression.leftOperand) !== this.execute(expression.rightOperand);
    }
    executeStringTemplate(expression) {
        let result = "";
        let isPolymorph = false;
        let polymorphString = "";
        for (let i = 0, len = expression.template.length; i < len; i++) {
            const char = expression.template[i];
            if (isPolymorph) {
                if (char === "}") {
                    const exp = ExpressionBuilder.parse(polymorphString);
                    result += this.execute(exp);
                    isPolymorph = false;
                }
                polymorphString += char;
            }
            else if (char === "$" && expression.template[i + 1] === "{") {
                isPolymorph = true;
                i++;
                polymorphString = "";
            }
            else {
                result += char;
            }
        }
        return result;
    }
    executeSubstraction(expression) {
        return this.execute(expression.leftOperand) - this.execute(expression.rightOperand);
    }
    executeSubstractionAssignment(expression) {
        const value = this.execute(expression.leftOperand) - this.execute(expression.rightOperand);
        this.stack.pop(expression.leftOperand.name);
        this.stack.push(expression.leftOperand.name, value);
        return value;
    }
    executeTernary(expression) {
        return this.execute(expression.logicalOperand) ? this.execute(expression.trueOperand) : this.execute(expression.falseOperand);
    }
    executeTypeof(expression) {
        return typeof this.execute(expression.operand);
    }
    executeValue(expression) {
        return expression.value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhwcmVzc2lvbkV4ZWN1dG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbkV4ZWN1dG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUM3RixPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSwrREFBK0QsQ0FBQztBQUNqSCxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUN6RixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNyRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDekUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDekUsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDN0YsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDekUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDekUsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDM0YsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDdkUsT0FBTyxFQUFFLDJDQUEyQyxFQUFFLE1BQU0sMERBQTBELENBQUM7QUFDdkgsT0FBTyxFQUFFLGlDQUFpQyxFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDbkcsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDN0YsT0FB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