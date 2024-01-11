
import { StateFsm } from "Common/StateFsm.mjs";

export class HeroesPage extends StateFsm {

      init(){
          //
      }
}

export const self:HeroesPage = global.$HeroesPage ??= new HeroesPage();
