import { StateFsm } from "Common/StateFsm.mjs";
export class CardAgent extends StateFsm {
    init() {
        console.log(`init ${this.constructor.name}`);
    }
}
export const self = global.$CardAgent ?? (global.$CardAgent = new CardAgent());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FyZEFnZW50Lm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvR2FtZS9DYXJkQWdlbnQubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUvQyxNQUFNLE9BQU8sU0FBVSxTQUFRLFFBQVE7SUFFakMsSUFBSTtRQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDakQsQ0FBQztDQUNOO0FBRUQsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFhLE1BQU0sQ0FBQyxVQUFVLEtBQWpCLE1BQU0sQ0FBQyxVQUFVLEdBQUssSUFBSSxTQUFTLEVBQUUsQ0FBQSxDQUFDIn0=