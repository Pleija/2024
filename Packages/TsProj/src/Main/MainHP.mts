
import { StateFsm } from "Common/StateFsm.mjs";

export class MainHP extends StateFsm {

      init(){
          //
      }
}

export const self:MainHP = global.$MainHP ??= new MainHP();
