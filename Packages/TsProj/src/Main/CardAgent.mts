
import { StateFsm } from "Common/StateFsm.mjs";

export class CardAgent extends StateFsm {

      init(){
          //
      }
}

export const self:CardAgent = global.$CardAgent ??= new CardAgent();
