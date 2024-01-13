
import { StateFsm } from "Common/StateFsm.mjs";
import Leaderboard = CS.Runner.UI.Leaderboard;
import LoadoutState = CS.Runner.Game.LoadoutState;
import Button = CS.UnityEngine.UI.Button;
import $typeof = puer.$typeof;

export class ChangeCharacterBtn extends StateFsm {

      init(){
          console.log("init ChangeCharacterBtn");
          (this.agent.GetComponent($typeof(Button)) as Button).onClick.AddListener(()=> {
              const value = LoadoutState.self.m_Character.activeInHierarchy;
              LoadoutState.self.m_Character.SetActive(!value);
              $LoadingCharPos.unityChan.gameObject.SetActive(value);  
          });
     
      }
}

export const self:ChangeCharacterBtn = global.$ChangeCharacterBtn ??= new ChangeCharacterBtn();
