
import { StateFsm } from "Common/StateFsm.mjs";

export class Main extends StateFsm {

      init(){
          console.log(`init ${this.constructor.name}`);
      }
}

export const self:Main = global.$Main ??= new Main();
