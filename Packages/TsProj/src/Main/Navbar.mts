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
import TMP_Text = CS.TMPro.TMP_Text;

export class Navbar extends StateFsm {
    currentImg: Sprite;
    currentColor: Color;
    normalImg: Sprite;
    normalColor: Color;
    buttons: Button[] = new Array(4);
    current: number = 2;

    init() {
        //
        iterator(this.fsm.agent.GetComponentsInChildren($typeof(Button))).forEach((x, i) => {
            let btn = x as Button;
            let image = btn.GetComponent($typeof(Image)) as Image;
            if (i == 2) {
                this.currentImg = image.sprite;
                this.currentColor = image.color;
            } else if (i == 0) {
                this.normalImg = image.sprite;
                this.normalColor = image.color; 
            }
            this.buttons[i] = btn;
            btn.onClick.AddListener(() => {
                //console.log(`click: ${i}`);
                this.setCurrent(this.buttons.indexOf(btn));
            });
            
        });
    }

    setCurrent(index: number) {
        const old = this.buttons[this.current].GetComponent($typeof(Image)) as Image;
        old.sprite = this.normalImg;
        old.color = this.normalColor;
        (this.buttons[this.current].GetComponent($typeof(LayoutElement)) as LayoutElement).minWidth = 129;
        let oldIcon = old.transform.Find("Image").GetComponent($typeof(RectTransform)) as RectTransform;
        this.buttons[this.current].GetComponentInChildren($typeof(TMP_Text),true).gameObject.SetActive(false);
        oldIcon.localScale = new Vector3(1,1,1);
        oldIcon.anchoredPosition = new Vector2(0,5);
        const target = this.buttons[index].GetComponent($typeof(Image)) as Image;
        target.sprite = this.currentImg;
        target.color = this.currentColor;
        let targetIcon = target.transform.Find("Image").GetComponent($typeof(RectTransform)) as RectTransform;
        targetIcon.localScale = new Vector3(1.2,1.2,1);
        targetIcon.anchoredPosition = new Vector2(0,42);
        (this.buttons[index].GetComponent($typeof(LayoutElement)) as LayoutElement).minWidth = 200;
        this.buttons[index].GetComponentInChildren($typeof(TMP_Text),true).gameObject.SetActive(true);
        if ($MenuArea.snap.CurrentPage != index) {
            $MenuArea.snap.GoToScreen(index);
        }
        this.current = index;
    }
}

export const self: Navbar = global.$Navbar ??= new Navbar();
