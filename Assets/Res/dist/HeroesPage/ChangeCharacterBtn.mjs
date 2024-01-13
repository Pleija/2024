import { StateFsm } from "Common/StateFsm.mjs";
var LoadoutState = CS.Runner.Game.LoadoutState;
var Button = CS.UnityEngine.UI.Button;
var $typeof = puer.$typeof;
export class ChangeCharacterBtn extends StateFsm {
    init() {
        console.log("init ChangeCharacterBtn");
        this.agent.GetComponent($typeof(Button)).onClick.AddListener(() => {
            const value = LoadoutState.self.m_Character.activeInHierarchy;
            LoadoutState.self.m_Character.SetActive(!value);
            $LoadingCharPos.unityChan.gameObject.SetActive(value);
        });
    }
}
export const self = global.$ChangeCharacterBtn ??= new ChangeCharacterBtn();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbmdlQ2hhcmFjdGVyQnRuLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvSGVyb2VzUGFnZS9DaGFuZ2VDaGFyYWN0ZXJCdG4ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUvQyxJQUFPLFlBQVksR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDbEQsSUFBTyxNQUFNLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO0FBQ3pDLElBQU8sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFFOUIsTUFBTSxPQUFPLGtCQUFtQixTQUFRLFFBQVE7SUFFMUMsSUFBSTtRQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUUsRUFBRTtZQUN6RSxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztZQUM5RCxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoRCxlQUFlLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUQsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDO0NBQ047QUFFRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQXNCLE1BQU0sQ0FBQyxtQkFBbUIsS0FBSyxJQUFJLGtCQUFrQixFQUFFLENBQUMifQ==