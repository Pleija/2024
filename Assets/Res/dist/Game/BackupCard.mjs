import { StateFsm } from "Common/StateFsm.mjs";
export class BackupCard extends StateFsm {
    init() {
        console.log("init BackupCard");
    }
}
export const self = global.$BackupCard ?? (global.$BackupCard = new BackupCard());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFja3VwQ2FyZC5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0dhbWUvQmFja3VwQ2FyZC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRS9DLE1BQU0sT0FBTyxVQUFXLFNBQVEsUUFBUTtJQUVsQyxJQUFJO1FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ25DLENBQUM7Q0FDTjtBQUVELE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBYyxNQUFNLENBQUMsV0FBVyxLQUFsQixNQUFNLENBQUMsV0FBVyxHQUFLLElBQUksVUFBVSxFQUFFLENBQUEsQ0FBQyJ9