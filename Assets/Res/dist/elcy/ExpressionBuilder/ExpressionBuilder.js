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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhwcmVzc2lvbkJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRXhwcmVzc2lvbkJ1aWxkZXIvRXhwcmVzc2lvbkJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSTFELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUV4RCxNQUFNLE9BQU8saUJBQWlCO0lBR25CLE1BQU0sQ0FBQyxLQUFLLENBQVUsRUFBZ0QsRUFBRSxVQUEwQixFQUFFLGNBQXdEO1FBQy9KLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLENBQUMsY0FBYyxZQUFZLGNBQWMsQ0FBQyxFQUFFLENBQUM7WUFDOUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUM1QyxjQUFjLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ25DLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDcEMsQ0FBQztRQUVELE9BQU8saUJBQWlCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsVUFBVSxFQUFFLGNBQWdDLENBQUMsQ0FBQztJQUNyRyxDQUFDO0NBQ0oifQ==