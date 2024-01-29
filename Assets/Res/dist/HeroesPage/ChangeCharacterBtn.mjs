import { StateFsm } from "Common/StateFsm.mjs";
var LoadoutState = CS.Runner.Game.LoadoutState;
var Button = CS.UnityEngine.UI.Button;
export class ChangeCharacterBtn extends StateFsm {
    init() {
        console.log("init ChangeCharacterBtn");
        const fn = () => {
            //const value = LoadoutState.self.m_Character.activeInHierarchy;
            LoadoutState.self.m_Character.SetActive(!LoadoutState.self.m_Character.activeInHierarchy);
            $LoadingCharPos.unityChan.gameObject.SetActive(!$LoadingCharPos.unityChan.gameObject.activeInHierarchy);
        };
        this.agent.Get(Button).onClick.AddListener(fn);
        // LoadoutState.self.m_Character.SetActive(false);
        // $LoadingCharPos.unityChan.gameObject.SetActive(true);
    }
    enter() {
    }
}
export const self = global.$ChangeCharacterBtn ??= new ChangeCharacterBtn();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbmdlQ2hhcmFjdGVyQnRuLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvSGVyb2VzUGFnZS9DaGFuZ2VDaGFyYWN0ZXJCdG4ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUvQyxJQUFPLFlBQVksR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDbEQsSUFBTyxNQUFNLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO0FBR3pDLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxRQUFRO0lBRTVDLElBQUk7UUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDdkMsTUFBTSxFQUFFLEdBQUcsR0FBRyxFQUFFO1lBQ1osZ0VBQWdFO1lBQ2hFLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDMUYsZUFBZSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM1RyxDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRS9DLGtEQUFrRDtRQUNsRCx3REFBd0Q7SUFFNUQsQ0FBQztJQUVELEtBQUs7SUFDTCxDQUFDO0NBQ0o7QUFFRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQXVCLE1BQU0sQ0FBQyxtQkFBbUIsS0FBSyxJQUFJLGtCQUFrQixFQUFFLENBQUMifQ==