import { StateFsm } from "Common/StateFsm.mjs";
import { MissionState } from "Main/Mission/MissionState.mjs";
export class Mission extends StateFsm {
    MissionState;
    init() {
        this.MissionState = new MissionState(this);
        //
    }
}
export const self = global.$Mission ??= new Mission();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlzc2lvbi5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL01haW4vTWlzc2lvbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUUzRCxNQUFNLE9BQU8sT0FBUSxTQUFRLFFBQVE7SUFDakMsWUFBWSxDQUFlO0lBRTNCLElBQUk7UUFDQSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLEVBQUU7SUFDTixDQUFDO0NBQ0o7QUFFRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQVksTUFBTSxDQUFDLFFBQVEsS0FBSyxJQUFJLE9BQU8sRUFBRSxDQUFDIn0=