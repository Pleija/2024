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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhwcmVzc2lvbkV4ZWN1dG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0V4cHJlc3Npb25CdWlsZGVyL0V4cHJlc3Npb25FeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDMUQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDN0YsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sK0RBQStELENBQUM7QUFDakgsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDekYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBQzdGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQzNGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSwyQ0FBMkMsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ3ZILE9BQU8sRUFBRSxpQ0FBaUMsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ25HLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBQzdGLE9B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