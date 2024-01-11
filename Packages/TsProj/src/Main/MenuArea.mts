import {StateFsm} from "Common/StateFsm.mjs";
import {MenuAreaStart} from "Main/MenuArea/MenuAreaStart.mjs";
import $typeof = puer.$typeof;
import HorizontalScrollSnap = CS.UnityEngine.UI.Extensions.HorizontalScrollSnap;
import ScrollRect = CS.UnityEngine.UI.ScrollRect;
import GameObject = CS.UnityEngine.GameObject;

export class MenuArea extends StateFsm {
    snap: HorizontalScrollSnap;
    characterSample: GameObject;
    MenuAreaStart: MenuAreaStart;

    init() {
        this.MenuAreaStart = new MenuAreaStart(this);
        this.characterSample.SetActive(false);
        //
        this.snap = this.fsm.agent.GetComponent($typeof(HorizontalScrollSnap)) as HorizontalScrollSnap;
        this.snap.OnSelectionPageChangedEvent.AddListener(index => {
            //console.log(`page: ${index}`);
            $Navbar.setCurrent(index);
            this.characterSample.SetActive(index == 1);
        });
        const scroll = this.snap.GetComponent($typeof(ScrollRect)) as ScrollRect;
        scroll.onValueChanged.AddListener(value => {
            //console.log(value.x, value.y);
        });
    }
}

export const self: MenuArea = global.$MenuArea ??= new MenuArea();
