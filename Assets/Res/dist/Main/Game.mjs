import { StateFsm } from "Common/StateFsm.mjs";
import { GameStart } from "Main/Game/GameStart.mjs";
export class Game extends StateFsm {
    GameStart;
    init() {
        this.GameStart = new GameStart(this);
    }
}
export const self = global.Game ??= new Game();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL01haW4vR2FtZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUVsRCxNQUFNLE9BQU8sSUFBSyxTQUFRLFFBQVE7SUFDOUIsU0FBUyxDQUFZO0lBRXJCLElBQUk7UUFDQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FFSjtBQUVELE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBUyxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMifQ==