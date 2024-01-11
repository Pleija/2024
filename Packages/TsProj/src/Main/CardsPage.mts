
import { StateFsm } from "Common/StateFsm.mjs";

export class CardsPage extends StateFsm {

      init(){
          //
      }
}

export const self:CardsPage = global.$CardsPage ??= new CardsPage();
