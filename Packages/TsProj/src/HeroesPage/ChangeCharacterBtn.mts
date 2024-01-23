import { StateFsm } from "Common/StateFsm.mjs";
import Leaderboard = CS.Runner.UI.Leaderboard;
import LoadoutState = CS.Runner.Game.LoadoutState;
import Button = CS.UnityEngine.UI.Button;
import $typeof = puer.$typeof;

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

export const self: ChangeCharacterBtn = global.$ChangeCharacterBtn ??= new ChangeCharacterBtn();
