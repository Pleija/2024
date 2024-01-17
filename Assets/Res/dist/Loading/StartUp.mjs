import { StateFsm } from "Common/StateFsm.mjs";
export class StartUp extends StateFsm {
    init() {
        console.log("init StartUp");
    }
}
export const self = global.$StartUp ??= new StartUp();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRVcC5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0xvYWRpbmcvU3RhcnRVcC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRS9DLE1BQU0sT0FBTyxPQUFRLFNBQVEsUUFBUTtJQUUvQixJQUFJO1FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ047QUFFRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQVcsTUFBTSxDQUFDLFFBQVEsS0FBSyxJQUFJLE9BQU8sRUFBRSxDQUFDIn0=