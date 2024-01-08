import { StateFsm } from "Common/StateFsm.mjs";
import { StartUpdating } from "Start/Updating/StartUpdating.mjs";

export class Updating extends StateFsm {
    StartUpdating: StartUpdating;

    init() {
        this.StartUpdating = new StartUpdating(this);
        //
    }
}

export const self: Updating = global.$Updating ??= new Updating();
