import { StateFsm } from "Common/StateFsm.mjs";
import { StartGame } from "Start/StartButton/StartGame.mjs";
export class StartButton extends StateFsm {
    init() {
        this.StartGame = this.bind(StartGame);
    }
}
export const self = global.$StartButton ?? (global.$StartButton = new StartButton());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRCdXR0b24ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9TdGFydC9TdGFydEJ1dHRvbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUU1RCxNQUFNLE9BQU8sV0FBWSxTQUFRLFFBQVE7SUFHckMsSUFBSTtRQUNBLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0o7QUFFRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQWdCLE1BQU0sQ0FBQyxZQUFZLEtBQW5CLE1BQU0sQ0FBQyxZQUFZLEdBQUssSUFBSSxXQUFXLEVBQUUsQ0FBQSxDQUFDIn0=