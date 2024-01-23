import StartUpAgent = CS.App.StartUpAgent;
import { StartUp } from "Loading/StartUp.mjs";
import { StateNode } from "Common/StateNode.mjs";


export class 下载更新 extends StartUpAgent {

    testVar: number;

    init() {
        console.log(`<color=red>init ${this.constructor.name}</color>`);
    }
}
