import { StateFsm } from "Common/StateFsm.mjs";
import { GameStart } from "Main/Game/GameStart.mjs";
import LoadoutState = CS.Runner.Game.LoadoutState;
import GameManager = CS.Runner.Game.GameManager;
import Debug = CS.UnityEngine.Debug;
import Addressables = CS.UnityEngine.AddressableAssets.Addressables;
import AsyncOperationStatus = CS.UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationStatus;
import $promise = puer.$promise;
import Application = CS.UnityEngine.Application;
import Loading = CS.App.Loading;
import RedisAdapter = CS.App.RedisAdapter;

export class Game extends StateFsm {
    GameStart: GameStart;

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
        RedisAdapter.self.OnUpdate.AddListener(() => {
            console.log("restart app");
            Loading.Restart();
        });
        this.agent.Get(GameManager).DoStart();

    }

}

export const self: Game = global.$Game ??= new Game();
