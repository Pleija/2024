import { StateFsm } from "Common/StateFsm.mjs";
import { LoadStart } from "Start/Login/LoadStart.mjs";
export class Login extends StateFsm {
    init() {
        this.LoadStart = this.bind(LoadStart);
    }
}
export const self = global.$Login ?? (global.$Login = new Login());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9naW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9TdGFydC9Mb2dpbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUdwRCxNQUFNLE9BQU8sS0FBTSxTQUFRLFFBQVE7SUFJL0IsSUFBSTtRQUNBLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0o7QUFFRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQVUsTUFBTSxDQUFDLE1BQU0sS0FBYixNQUFNLENBQUMsTUFBTSxHQUFLLElBQUksS0FBSyxFQUFFLENBQUEsQ0FBQyJ9