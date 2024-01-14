import {StateFsm} from "Common/StateFsm.mjs";
import {GameStart} from "Main/Game/GameStart.mjs";
import LoadoutState = CS.Runner.Game.LoadoutState;
import GameManager = CS.Runner.Game.GameManager;

export class Game extends StateFsm {
    GameStart: GameStart;

    init() {
        this.GameStart = new GameStart(this);
        LoadoutState.self.OnCharacterCreate.AddListener(t => {
            // console.log("test event hook");
            t.SetActive(false);
            //$LoadingCharPos.unityChan.gameObject.SetActive(true);
        });
        this.agent.Get(GameManager).DoStart();

    }

}

export const self: Game = global.$Game ??= new Game();
