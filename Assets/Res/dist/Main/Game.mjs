import { StateFsm } from "Common/StateFsm.mjs";
import { GameStart } from "Main/Game/GameStart.mjs";
var LoadoutState = CS.Runner.Game.LoadoutState;
var GameManager = CS.Runner.Game.GameManager;
var Debug = CS.UnityEngine.Debug;
var Addressables = CS.UnityEngine.AddressableAssets.Addressables;
var AsyncOperationStatus = CS.UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationStatus;
var $promise = puer.$promise;
var JsMain = CS.App.JsMain;
var Application = CS.UnityEngine.Application;
export class Game extends StateFsm {
    GameStart;
    init() {
        this.GameStart = new GameStart(this);
        LoadoutState.self.OnCharacterCreate.AddListener(t => {
            // console.log("test event hook");
            t.SetActive(false);
            //$LoadingCharPos.unityChan.gameObject.SetActive(true);
        });
        LoadoutState.self.OnEnter.AddListener(async () => {
            if (Debug.isDebugBuild || Application.isEditor) {
                const handle = Addressables.CheckForCatalogUpdates(false);
                await $promise(handle.Task);
                if (handle.Status == AsyncOperationStatus.Succeeded && handle.Result.Count > 0) {
                    Debug.Log("Catalog updating");
                    await $promise(Addressables.UpdateCatalogs(handle.Result).Task);
                    await $promise(Addressables.DownloadDependenciesAsync("Main").Task);
                    await $promise(JsMain.self.Reload(true));
                    Addressables.LoadSceneAsync("Main");
                }
                //Addressables.Release(handle as any);
            }
        });
        this.agent.Get(GameManager).DoStart();
    }
}
export const self = global.$Game ??= new Game();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL01haW4vR2FtZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUNsRCxJQUFPLFlBQVksR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDbEQsSUFBTyxXQUFXLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQ2hELElBQU8sS0FBSyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO0FBQ3BDLElBQU8sWUFBWSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDO0FBQ3BFLElBQU8sb0JBQW9CLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsb0JBQW9CLENBQUM7QUFDckcsSUFBTyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNoQyxJQUFPLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztBQUM5QixJQUFPLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztBQUVoRCxNQUFNLE9BQU8sSUFBSyxTQUFRLFFBQVE7SUFDOUIsU0FBUyxDQUFZO0lBRXJCLElBQUk7UUFDQSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLFlBQVksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2hELGtDQUFrQztZQUNsQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLHVEQUF1RDtRQUMzRCxDQUFDLENBQUMsQ0FBQztRQUNILFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUM3QyxJQUFJLEtBQUssQ0FBQyxZQUFZLElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUM3QyxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFELE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFNUIsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLG9CQUFvQixDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDN0UsS0FBSyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUM5QixNQUFNLFFBQVEsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDaEUsTUFBTSxRQUFRLENBQUMsWUFBWSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwRSxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN4QyxDQUFDO2dCQUNELHNDQUFzQztZQUMxQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUUxQyxDQUFDO0NBRUo7QUFFRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQVMsTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLElBQUksRUFBRSxDQUFDIn0=