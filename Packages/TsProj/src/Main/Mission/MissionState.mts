import { Mission } from "Main/Mission.mjs";
import { StateNode } from "Common/StateNode.mjs";

export class MissionState extends StateNode<Mission> {
    init() {
        console.log("关卡页面 init");
    }

    enter() {
        console.log("关卡页面开始");
    }
}
