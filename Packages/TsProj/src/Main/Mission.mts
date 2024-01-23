import { StateFsm } from "Common/StateFsm.mjs";
import { MissionState } from "Main/Mission/MissionState.mjs";

export class Mission extends StateFsm {
    MissionState: MissionState;

    init() {
        this.MissionState = this.bind(MissionState);
        //
    }
}

export const self: Mission = global.$Mission ??= new Mission();
