
import { StateFsm } from "Common/StateFsm.mjs";

export class StartUp extends StateFsm {

      init(){
          console.log("init StartUp");
      }
}

export const self:StartUp = global.$StartUp ??= new StartUp();
