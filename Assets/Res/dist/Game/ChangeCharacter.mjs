import { StateFsm } from "Common/StateFsm.mjs";
export class ChangeCharacter extends StateFsm {
    init() {
        console.log("init ChangeCharacter test");
    }
}
export const self = global.$ChangeCharacter ??= new ChangeCharacter();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbmdlQ2hhcmFjdGVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvR2FtZS9DaGFuZ2VDaGFyYWN0ZXIubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUvQyxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxRQUFRO0lBRXpDLElBQUk7UUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUNKO0FBRUQsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFvQixNQUFNLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxlQUFlLEVBQUUsQ0FBQyJ9