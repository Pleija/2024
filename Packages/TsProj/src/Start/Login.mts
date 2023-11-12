import { StateFsm } from "Common/StateFsm.mjs";
import { LoadStart } from "Start/Login/LoadStart.mjs";
import FSM = CS.NodeCanvas.StateMachines.FSM;

export class Login extends StateFsm {

    LoadStart: LoadStart;

    init() {
        this.LoadStart = new LoadStart(this);
    }
}

export const self: Login = global.Login ??= new Login();