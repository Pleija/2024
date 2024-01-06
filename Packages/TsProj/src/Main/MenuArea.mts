import {StateFsm} from "Common/StateFsm.mjs";
import $typeof = puer.$typeof;
import HorizontalScrollSnap = CS.UnityEngine.UI.Extensions.HorizontalScrollSnap;

export class MenuArea extends StateFsm {

    init() {
        //
        const snap = this.fsm.agent.GetComponent($typeof(HorizontalScrollSnap)) as HorizontalScrollSnap;
        snap.OnSelectionPageChangedEvent.AddListener(index => {
            console.log(`page: ${index}`);
        });
    }
}

export const self: MenuArea = global.MenuArea ??= new MenuArea();
