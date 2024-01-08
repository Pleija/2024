
import { StateFsm } from "Common/StateFsm.mjs";

export class SeededRun extends StateFsm {

}

export const self:SeededRun = global.$SeededRun ??= new SeededRun();
