import { StateFsm } from "Common/StateFsm.mjs";

export class GameOverState extends StateFsm {

}

 export const self:GameOverState = global.$GameOverState ??= new GameOverState();