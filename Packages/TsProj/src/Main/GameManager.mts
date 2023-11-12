import { StateFsm } from "Common/StateFsm.mjs";

export class GameManager extends StateFsm {

}

export const self:GameManager = global.GameManager ??= new GameManager();