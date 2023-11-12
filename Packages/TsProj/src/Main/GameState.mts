import { StateFsm } from "Common/StateFsm.mjs";

export class GameState extends StateFsm{

}

export const self:GameState = global.GameState ??= new GameState();