import { StateFsm } from "Common/StateFsm.mjs";
var $typeof = puer.$typeof;
var Button = CS.UnityEngine.UI.Button;
import { iterator } from "Common/Iterator.mjs";
var PlayerData = CS.Runner.PlayerData;
var LoadoutState = CS.Runner.Game.LoadoutState;
export class LevelStart extends StateFsm {
    init() {
        iterator(this.agent.GetComponentsInChildren($typeof(Button), true)).forEach(btn => {
            btn.onClick.AddListener(() => {
                PlayerData.instance.tutorialDone = true;
                this.startGame();
            });
        });
    }
    startGame() {
        LoadoutState.self.StartGame();
    }
}
export const self = global.$LevelStart ??= new LevelStart();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGV2ZWxTdGFydC5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL01haW4vTGV2ZWxTdGFydC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLElBQU8sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDOUIsSUFBTyxNQUFNLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUU3QyxJQUFPLFVBQVUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUl6QyxJQUFPLFlBQVksR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7QUFFbEQsTUFBTSxPQUFPLFVBQVcsU0FBUSxRQUFRO0lBRXBDLElBQUk7UUFDQSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFvQixDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2pHLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtnQkFDekIsVUFBVSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN4QyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxTQUFTO1FBQ0wsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0NBQ0o7QUFFRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQWUsTUFBTSxDQUFDLFdBQVcsS0FBSyxJQUFJLFVBQVUsRUFBRSxDQUFDIn0=