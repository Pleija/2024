import { StateFsm } from "Common/StateFsm.mjs";
export class LoadingCharPos extends StateFsm {
    unityChan;
    init() {
        console.log("init LoadingCharPos");
    }
}
export const self = global.$LoadingCharPos ??= new LoadingCharPos();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9hZGluZ0NoYXJQb3MubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9NYWluL0xvYWRpbmdDaGFyUG9zLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFHL0MsTUFBTSxPQUFPLGNBQWUsU0FBUSxRQUFRO0lBRXhDLFNBQVMsQ0FBYTtJQUV0QixJQUFJO1FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBRXZDLENBQUM7Q0FDSjtBQUVELE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBbUIsTUFBTSxDQUFDLGVBQWUsS0FBSyxJQUFJLGNBQWMsRUFBRSxDQUFDIn0=