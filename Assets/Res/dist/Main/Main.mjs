import { StateFsm } from "Common/StateFsm.mjs";
export class Main extends StateFsm {
    init() {
        console.log(`init ${this.constructor.name}`);
    }
}
export const self = global.$Main ??= new Main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL01haW4vTWFpbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRS9DLE1BQU0sT0FBTyxJQUFLLFNBQVEsUUFBUTtJQUU5QixJQUFJO1FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNqRCxDQUFDO0NBQ0o7QUFFRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQVMsTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDIn0=