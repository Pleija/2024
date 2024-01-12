
import { StateFsm } from "Common/StateFsm.mjs";
import GameObject = CS.UnityEngine.GameObject;
import Button = CS.UnityEngine.UI.Button;
import $typeof = puer.$typeof;
import {iterator} from "Common/Iterator.mjs";
import Array$1 = CS.System.Array$1;
import PlayerData = CS.Runner.PlayerData;

export class Settings extends StateFsm {

      settingsPop: GameObject;
      dropDataBtn: Button;
      init(){
          const btn = this.agent.GetComponent($typeof(Button)) as Button;
          btn.onClick.AddListener(()=> {
                this.settingsPop.SetActive(!this.settingsPop.activeInHierarchy);
               iterator(this.settingsPop.GetComponentsInChildren($typeof(Button)) as Array$1<Button>).forEach(item => {
                     item.onClick.AddListener(()=> {
                           this.settingsPop.SetActive(false);
                     });
               }); 
          });
          this.dropDataBtn.onClick.AddListener(()=> {
                PlayerData.conn.DropTable($typeof(PlayerData));
                console.log("drop PlayerData ok.");
          });
          this.settingsPop.SetActive(false);
      }
}

export const self:Settings = global.$Settings ??= new Settings();
