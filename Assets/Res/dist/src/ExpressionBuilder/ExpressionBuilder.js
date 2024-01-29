import { ParameterStack } from "../Common/ParameterStack";
import { LexicalAnalyzer } from "./LexicalAnalyzer";
import { SyntacticAnalyzer } from "./SyntacticAnalyzer";
export class ExpressionBuilder {
    static parse(fn, paramTypes, userParameters) {
        const tokens = LexicalAnalyzer.parse(fn.toString());
        if (!(userParameters instanceof ParameterStack)) {
            const parameterStack = new ParameterStack();
            parameterStack.set(userParameters);
            userParameters = parameterStack;
        }
        return SyntacticAnalyzer.parse(Array.from(tokens), paramTypes, userParameters);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhwcmVzc2lvbkJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9FeHByZXNzaW9uQnVpbGRlci9FeHByZXNzaW9uQnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFJMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXhELE1BQU0sT0FBTyxpQkFBaUI7SUFHbkIsTUFBTSxDQUFDLEtBQUssQ0FBVSxFQUFnRCxFQUFFLFVBQTBCLEVBQUUsY0FBd0Q7UUFDL0osTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsQ0FBQyxjQUFjLFlBQVksY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUM5QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBQzVDLGNBQWMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbkMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNwQyxDQUFDO1FBRUQsT0FBTyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxVQUFVLEVBQUUsY0FBZ0MsQ0FBQyxDQUFDO0lBQ3JHLENBQUM7Q0FDSiJ9