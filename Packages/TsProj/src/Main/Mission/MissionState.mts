import { Mission } from "Main/Mission.mjs";
import { StateNode } from "Common/StateNode.mjs";

export class MissionState extends StateNode<Mission> {
      enter(){
          console.log("关卡页面开始");
      }
}
