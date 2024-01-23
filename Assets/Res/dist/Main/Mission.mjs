import { StateFsm } from "Common/StateFsm.mjs";
import { MissionState } from "Main/Mission/MissionState.mjs";
export class Mission extends StateFsm {
    init() {
        this.MissionState = this.bind(MissionState);
        //
    }
}
export const self = global.$Mission ?? (global.$Mission = new Mission());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlzc2lvbi5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL01haW4vTWlzc2lvbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUU3RCxNQUFNLE9BQU8sT0FBUSxTQUFRLFFBQVE7SUFHakMsSUFBSTtRQUNBLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QyxFQUFFO0lBQ04sQ0FBQztDQUNKO0FBRUQsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFZLE1BQU0sQ0FBQyxRQUFRLEtBQWYsTUFBTSxDQUFDLFFBQVEsR0FBSyxJQUFJLE9BQU8sRUFBRSxDQUFBLENBQUMifQ==