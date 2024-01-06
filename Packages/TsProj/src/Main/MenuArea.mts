import {StateFsm} from "Common/StateFsm.mjs";
import $typeof = puer.$typeof;
import HorizontalScrollSnap = CS.UnityEngine.UI.Extensions.HorizontalScrollSnap;

export class MenuArea extends StateFsm {
    snap: HorizontalScrollSnap;

    init() {
        //
        this.snap = this.fsm.agent.GetComponent($typeof(HorizontalScrollSnap)) as HorizontalScrollSnap;
        this.snap.OnSelectionPageChangedEvent.AddListener(index => {
            console.log(`page: ${index}`);
            Navbar.setCurrent(index);
        });
    }
}

export const self: MenuArea = global.MenuArea ??= new MenuArea();
