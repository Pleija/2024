import {StateFsm} from "Common/StateFsm.mjs";
import {MenuAreaStart} from "Main/MenuArea/MenuAreaStart.mjs";
import $typeof = puer.$typeof;
import HorizontalScrollSnap = CS.UnityEngine.UI.Extensions.HorizontalScrollSnap;
import ScrollRect = CS.UnityEngine.UI.ScrollRect;
import GameObject = CS.UnityEngine.GameObject;
import RectTransform = CS.UnityEngine.RectTransform;
import Vector2 = CS.UnityEngine.Vector2;

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
       //let rt = (this.snap.GetComponent($typeof(ScrollRect)) as ScrollRect).content.GetComponent($typeof(RectTransform)) as RectTransform;
       //rt.sizeDelta = new Vector2(3600, rt.sizeDelta.y);
        this.snap.GoToScreen(2);
    }
}

export const self: MenuArea = global.$MenuArea ??= new MenuArea();
