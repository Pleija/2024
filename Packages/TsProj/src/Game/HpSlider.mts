import { StateFsm } from "Common/StateFsm.mjs";
import { Start } from "Game/HpSlider/Start.mjs";

export class HpSlider extends StateFsm {
    Start: Start;

    init() {
        this.Start = this.bind(Start);
        console.log("init HpSlider");
    }
}

export const self: HpSlider = global.$HpSlider ??= new HpSlider();
