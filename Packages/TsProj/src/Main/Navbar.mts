import {StateFsm} from "Common/StateFsm.mjs";
import $typeof = puer.$typeof;
import Button = CS.UnityEngine.UI.Button;
import {iterator} from "Common/Iterator.mjs";
import Image = CS.UnityEngine.UI.Image;
import Sprite = CS.UnityEngine.Sprite;
import Color = CS.UnityEngine.Color;
import LayoutElement = CS.UnityEngine.UI.LayoutElement;
import RectTransform = CS.UnityEngine.RectTransform;
import Vector3 = CS.UnityEngine.Vector3;
import Vector2 = CS.UnityEngine.Vector2;

export class Navbar extends StateFsm {
    currentImg: Sprite;
    currentColor: Color;
    normalImg: Sprite;
    normalColor: Color;
    buttons: Button[] = new Array(4);
    current: number = 0;

    init() {
        //
        iterator(this.fsm.agent.GetComponentsInChildren($typeof(Button))).forEach((x, i) => {
            let btn = x as Button;
            let image = btn.GetComponent($typeof(Image)) as Image;
            if (i == 0) {
                this.currentImg = image.sprite;
                this.currentColor = image.color;
            } else if (i == 1) {
                this.normalImg = image.sprite;
                this.normalColor = image.color; 
            }
            this.buttons[i] = btn;
            btn.onClick.AddListener(() => {
                console.log(`click: ${i}`);
                this.setCurrent(this.buttons.indexOf(btn));
            });
        });
    }

    setCurrent(index: number) {
        const old = this.buttons[this.current].GetComponent($typeof(Image)) as Image;
        old.sprite = this.normalImg;
        old.color = this.normalColor;
        (old.GetComponent($typeof(LayoutElement)) as LayoutElement).minWidth = 172;
        let oldIcon = old.transform.Find("Image").GetComponent($typeof(RectTransform)) as RectTransform;
        oldIcon.localScale = new Vector3(1,1,1);
        oldIcon.anchoredPosition = new Vector2(0,32);
        const target = this.buttons[index].GetComponent($typeof(Image)) as Image;
        target.sprite = this.currentImg;
        target.color = this.currentColor;
        let targetIcon = target.transform.Find("Image").GetComponent($typeof(RectTransform)) as RectTransform;
        targetIcon.localScale = new Vector3(1.2,1.2,1);
        targetIcon.anchoredPosition = new Vector2(0,42);
        (target.GetComponent($typeof(LayoutElement)) as LayoutElement).minWidth = 200;
        if (MenuArea.snap.CurrentPage != index) {
            MenuArea.snap.GoToScreen(index);
        }
        this.current = index;
    }
}

export const self: Navbar = global.Navbar ??= new Navbar();
