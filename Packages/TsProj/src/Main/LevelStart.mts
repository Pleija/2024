import {StateFsm} from "Common/StateFsm.mjs";
import $typeof = puer.$typeof;
import Button = CS.UnityEngine.UI.Button;
import {iterator} from "Common/Iterator.mjs";
import Array$1 = CS.System.Array$1;
import PlayerData = CS.Runner.PlayerData;
import GameManager = CS.Runner.Game.GameManager;
import SceneLoader = CS.Runner.SceneLoader;
import AnalyticsEvent = CS.UnityEngine.Analytics.AnalyticsEvent;
import LoadoutState = CS.Runner.Game.LoadoutState;

export class LevelStart extends StateFsm {

    init() {
        iterator(this.agent.GetComponentsInChildren($typeof(Button), true) as Array$1<Button>).forEach(btn => {
            btn.onClick.AddListener(() => {
                PlayerData.instance.tutorialDone = true;
                this.startGame();
            })
        });
    }

    startGame() {
        LoadoutState.self.StartGame();
    }
}

export const self: LevelStart = global.$LevelStart ??= new LevelStart();
