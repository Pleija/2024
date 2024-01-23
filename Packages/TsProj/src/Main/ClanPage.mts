import { StateFsm } from "Common/StateFsm.mjs";

export class ClanPage extends StateFsm {

    init() {
        //
    }
}

export const self: ClanPage = global.$ClanPage ??= new ClanPage();
