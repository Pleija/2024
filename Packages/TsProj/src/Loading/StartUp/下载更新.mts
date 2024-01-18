import {StartUp} from "Loading/StartUp.mjs";
import StartUpAgent = CS.App.StartUpAgent;
import {StateFsm} from "Common/StateFsm.mjs";


export class 下载更新 extends StartUpAgent {

    testVar: number;

    init() {
        console.log(`init ${this.constructor.name}`);
    }
}
