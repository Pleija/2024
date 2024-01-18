import { StateFsm } from "Common/StateFsm.mjs";
import { StartGame } from "Start/StartButton/StartGame.mjs";

export class StartButton extends StateFsm {
    StartGame: StartGame;

    init() {
        this.StartGame = this.bind(StartGame);
    }
}

export const self: StartButton = global.$StartButton ??= new StartButton();