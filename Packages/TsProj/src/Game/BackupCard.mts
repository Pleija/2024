
import { StateFsm } from "Common/StateFsm.mjs";

export class BackupCard extends StateFsm {

      init(){
          console.log("init BackupCard");
      }
}

export const self:BackupCard = global.$BackupCard ??= new BackupCard();
