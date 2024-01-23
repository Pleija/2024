import { StateFsm } from "Common/StateFsm.mjs";
import $typeof = puer.$typeof;
import Button = CS.UnityEngine.UI.Button;
import { iterator } from "Common/Iterator.mjs";
import Image = CS.UnityEngine.UI.Image;
import Sprite = CS.UnityEngine.Sprite;
import Color = CS.UnityEngine.Color;
import LayoutElement = CS.UnityEngine.UI.LayoutElement;
import RectTransform = CS.UnityEngine.RectTransform;
import Vector3 = CS.UnityEngine.Vector3;
import Vector2 = CS.UnityEngine.Vector2;
import TMP_Text = CS.TMPro.TMP_Text;
import IObserver$1 = CS.System.IObserver$1;
import Unit = CS.UniRx.Unit;
import IObservable$1 = CS.System.IObservable$1;
import Subject$1 = CS.UniRx.Subject$1;
import GameObject = CS.UnityEngine.GameObject;
import Transform = CS.UnityEngine.Transform;
import LoadoutState = CS.Runner.Game.LoadoutState;

export class Navbar extends StateFsm {
    currentImg: Sprite;
    currentColor: Color;
    normalImg: Sprite;
    normalColor: Color;
    private buttons: Button[] = [];
    private current: number = 2;
    bg: Transform;

    init() {

        //
        iterator(this.fsm.agent.GetComponentsInChildren($typeof(Button))).forEach((x, i) => {
            let btn = x as Button;
            // let image = btn.GetComponent($typeof(Image)) as Image;
            // if (i == 2) {
            //     this.currentImg = image.sprite;
            //     this.currentColor = image.color;
            // } else if (i == 0) {
            //     this.normalImg = image.sprite;
            //     this.normalColor = image.color; 
            // }
            this.buttons[i] = btn;
            btn.onClick.AddListener(() => {
                //console.log(`click: ${i}`);
                this.setCurrent(this.buttons.indexOf(btn));
            });

        });

        // (this.fsm.agent.OnEnableAsObservable() as Subject$1<Unit>).Subscribe(() => {
        //     console.log("Navbar enable");
        // });

        // todo: 没用, 因为 jsEnv已经被销毁了
        // (this.fsm.agent.OnDisableAsObservable() as  Subject$1<Unit>).Subscribe(()=> {
        //     console.log("Navbar disable");
        // });
    }


    setCurrent(index: number) {
        if (this.buttons.length == 0) {
            return;
        }
        const old = this.buttons[this.current].GetComponent($typeof(Image)) as Image;
        //old.enabled = true;
        // old.sprite = this.normalImg;
        // old.color = this.normalColor;
        (this.buttons[this.current].GetComponent($typeof(LayoutElement)) as LayoutElement).minWidth = 129;
        (this.buttons[this.current].GetComponent($typeof(LayoutElement)) as LayoutElement).minHeight = 0;

        let oldIcon = old.transform.Find("Image").GetComponent($typeof(RectTransform)) as RectTransform;
        (this.buttons[this.current].GetComponentInChildren($typeof(TMP_Text), true) as TMP_Text).DOFade(0, 0);//.gameObject.SetActive(false);
        //oldIcon.localScale = new Vector3(1, 1, 1);
        oldIcon.DOScale(new Vector3(1, 1, 1), 0.2);
        //oldIcon.anchoredPosition = new Vector2(0, 5);
        oldIcon.DOAnchorPos(new Vector2(0, 5), 0.2);
        const target = this.buttons[index].GetComponent($typeof(Image)) as Image;
        //target.enabled = false;
        // target.sprite = this.currentImg;
        // target.color = this.currentColor;
        let targetIcon = target.transform.Find("Image").GetComponent($typeof(RectTransform)) as RectTransform;
        //targetIcon.localScale = new Vector3(1.2, 1.2, 1);
        targetIcon.DOScale(new Vector3(1.2, 1.2, 1), 0.2);

        //targetIcon.anchoredPosition = new Vector2(0, 42);
        targetIcon.DOAnchorPos(new Vector2(0, 42), 0.2);
        (this.buttons[index].GetComponent($typeof(LayoutElement)) as LayoutElement).minWidth = 200;
        (this.buttons[index].GetComponent($typeof(LayoutElement)) as LayoutElement).minHeight = 180;
        (this.buttons[index].GetComponentInChildren($typeof(TMP_Text), true) as TMP_Text).DOFade(1, 0.2);//.gameObject.SetActive(true);

        const bgRect = this.bg.GetComponent($typeof(RectTransform)) as RectTransform;
        const rect = this.buttons[index].GetComponent($typeof(RectTransform)) as RectTransform;
        //bgRect.anchoredPosition = rect.anchoredPosition;
        let map = [102, 231, 360, 489, 618];
        // bgRect.anchoredPosition = new CS.UnityEngine.Vector2(map[index],-92);
        // console.log(bgRect.anchoredPosition, rect.anchoredPosition);
        bgRect.DOAnchorPos(new CS.UnityEngine.Vector2(map[index], -92), 0.5);
        this.current = index;
        if ($MenuArea.snap.CurrentPage != index) {
            $MenuArea.snap.GoToScreen(index);
        }
    }
}

export const self: Navbar = global.$Navbar ??= new Navbar();
