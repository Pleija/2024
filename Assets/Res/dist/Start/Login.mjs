import { StateFsm } from "Common/StateFsm.mjs";
import { LoadStart } from "Start/Login/LoadStart.mjs";
export class Login extends StateFsm {
    LoadStart;
    init() {
        this.LoadStart = new LoadStart(this);
    }
}
export const self = global.Login ??= new Login();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9naW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9TdGFydC9Mb2dpbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUd0RCxNQUFNLE9BQU8sS0FBTSxTQUFRLFFBQVE7SUFFL0IsU0FBUyxDQUFZO0lBRXJCLElBQUk7UUFDQSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7Q0FDSjtBQUVELE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBVSxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUksS0FBSyxFQUFFLENBQUMifQ==