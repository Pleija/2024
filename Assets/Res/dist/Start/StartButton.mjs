import { StateFsm } from "Common/StateFsm.mjs";
import { StartGame } from "Start/StartButton/StartGame.mjs";
export class StartButton extends StateFsm {
    StartGame;
    init() {
        this.StartGame = new StartGame(this);
    }
}
export const self = global.$StartButton ??= new StartButton();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRCdXR0b24ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9TdGFydC9TdGFydEJ1dHRvbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUU1RCxNQUFNLE9BQU8sV0FBWSxTQUFRLFFBQVE7SUFDckMsU0FBUyxDQUFZO0lBRXJCLElBQUk7UUFDQSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7Q0FDSjtBQUVELE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBZ0IsTUFBTSxDQUFDLFlBQVksS0FBSyxJQUFJLFdBQVcsRUFBRSxDQUFDIn0=