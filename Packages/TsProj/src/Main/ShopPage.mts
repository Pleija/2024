
import { StateFsm } from "Common/StateFsm.mjs";

export class ShopPage extends StateFsm {

      init(){
          //
      }
}

export const self:ShopPage = global.$ShopPage ??= new ShopPage();
