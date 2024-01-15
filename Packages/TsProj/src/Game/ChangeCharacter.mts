
import { StateFsm } from "Common/StateFsm.mjs";

export class ChangeCharacter extends StateFsm {

      init(){
          console.log("init ChangeCharacter test");
      }
}

export const self:ChangeCharacter = global.$ChangeCharacter ??= new ChangeCharacter();
