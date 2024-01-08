import {StateFsm} from "Common/StateFsm.mjs";
import {MissionState} from "Main/Mission/MissionState.mjs";

export class Mission extends StateFsm {
    MissionState: MissionState;

    init() {
        this.MissionState = new MissionState(this);
        //
    }
}

export const self: Mission = global.$Mission ??= new Mission();
