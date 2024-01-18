import { StateFsm } from "Common/StateFsm.mjs";
export class ChangeCharacter extends StateFsm {
    init() {
        console.log("init ChangeCharacter test");
    }
}
export const self = global.$ChangeCharacter ?? (global.$ChangeCharacter = new ChangeCharacter());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbmdlQ2hhcmFjdGVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvR2FtZS9DaGFuZ2VDaGFyYWN0ZXIubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUvQyxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxRQUFRO0lBRXZDLElBQUk7UUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUNOO0FBRUQsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFtQixNQUFNLENBQUMsZ0JBQWdCLEtBQXZCLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBSyxJQUFJLGVBQWUsRUFBRSxDQUFBLENBQUMifQ==