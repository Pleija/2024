import { StateFsm } from "Common/StateFsm.mjs";
import { StartUpdating } from "Start/Updating/StartUpdating.mjs";
export class Updating extends StateFsm {
    StartUpdating;
    init() {
        this.StartUpdating = new StartUpdating(this);
        //
    }
}
export const self = global.$Updating ??= new Updating();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRpbmcubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9TdGFydC9VcGRhdGluZy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUVqRSxNQUFNLE9BQU8sUUFBUyxTQUFRLFFBQVE7SUFDbEMsYUFBYSxDQUFnQjtJQUU3QixJQUFJO1FBQ0EsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QyxFQUFFO0lBQ04sQ0FBQztDQUNKO0FBRUQsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFhLE1BQU0sQ0FBQyxTQUFTLEtBQUssSUFBSSxRQUFRLEVBQUUsQ0FBQyJ9