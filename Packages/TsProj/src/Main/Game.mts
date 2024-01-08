import {StateFsm} from "Common/StateFsm.mjs";
import {GameStart} from "Main/Game/GameStart.mjs";

export class Game extends StateFsm {
    GameStart: GameStart;

    init(){
         this.GameStart = new GameStart(this);
    }

}

export const self: Game = global.$Game ??= new Game();
