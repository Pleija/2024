import { StateFsm } from "Common/StateFsm.mjs";
import { GameStart } from "Main/Game/GameStart.mjs";
var LoadoutState = CS.Runner.Game.LoadoutState;
var GameManager = CS.Runner.Game.GameManager;
var Debug = CS.UnityEngine.Debug;
var Addressables = CS.UnityEngine.AddressableAssets.Addressables;
var AsyncOperationStatus = CS.UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationStatus;
var $promise = puer.$promise;
var Application = CS.UnityEngine.Application;
var Redis = CS.App.Redis;
var Loading = CS.App.Loading;
export class Game extends StateFsm {
    init() {
        this.GameStart = this.bind(GameStart);
        LoadoutState.self.OnCharacterCreate.AddListener(t => {
            // console.log("test event hook");
            t.SetActive(false);
            //$LoadingCharPos.unityChan.gameObject.SetActive(true);
        });
        LoadoutState.self.OnEnter.AddListener(async () => {
            if (Debug.isDebugBuild || Application.isEditor) {
                const handle = Addressables.CheckForCatalogUpdates(false);
                await $promise(handle.Task);
                if (handle.Status == AsyncOperationStatus.Succeeded && handle.Result?.Count > 0) {
                    console.log("restart app");
                    Loading.Restart();
                }
            }
        });
        Redis.self.OnUpdate.AddListener(() => {
            console.log("restart app");
            Loading.Restart();
        });
        this.agent.Get(GameManager).DoStart();
    }
}
export const self = global.$Game ?? (global.$Game = new Game());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL01haW4vR2FtZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUNsRCxJQUFPLFlBQVksR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDbEQsSUFBTyxXQUFXLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQ2hELElBQU8sS0FBSyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO0FBQ3BDLElBQU8sWUFBWSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDO0FBQ3BFLElBQU8sb0JBQW9CLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsb0JBQW9CLENBQUM7QUFDckcsSUFBTyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNoQyxJQUFPLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztBQUNoRCxJQUFPLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUM1QixJQUFPLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztBQUVoQyxNQUFNLE9BQU8sSUFBSyxTQUFRLFFBQVE7SUFHOUIsSUFBSTtRQUNBLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0QyxZQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNoRCxrQ0FBa0M7WUFDbEMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQix1REFBdUQ7UUFDM0QsQ0FBQyxDQUFDLENBQUM7UUFDSCxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFFN0MsSUFBSSxLQUFLLENBQUMsWUFBWSxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDN0MsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRTVCLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxvQkFBb0IsQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzlFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQzNCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNGLEtBQUssQ0FBQyxJQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFFLEVBQUU7WUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMzQixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUUxQyxDQUFDO0NBRUo7QUFFRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQVMsTUFBTSxDQUFDLEtBQUssS0FBWixNQUFNLENBQUMsS0FBSyxHQUFLLElBQUksSUFBSSxFQUFFLENBQUEsQ0FBQyJ9