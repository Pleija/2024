
import { StateFsm } from "Common/StateFsm.mjs";

export class MissionPage extends StateFsm {

      init(){
          //
      }
}

export const self:MissionPage = global.$MissionPage ??= new MissionPage();
