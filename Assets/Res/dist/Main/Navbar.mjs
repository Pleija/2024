import { StateFsm } from "Common/StateFsm.mjs";
var $typeof = puer.$typeof;
var Button = CS.UnityEngine.UI.Button;
import { iterator } from "Common/Iterator.mjs";
var Image = CS.UnityEngine.UI.Image;
var LayoutElement = CS.UnityEngine.UI.LayoutElement;
var RectTransform = CS.UnityEngine.RectTransform;
var Vector3 = CS.UnityEngine.Vector3;
var Vector2 = CS.UnityEngine.Vector2;
var TMP_Text = CS.TMPro.TMP_Text;
export class Navbar extends StateFsm {
    constructor() {
        super(...arguments);
        this.buttons = [];
        this.current = 2;
    }
    init() {
        //
        iterator(this.fsm.agent.GetComponentsInChildren($typeof(Button))).forEach((x, i) => {
            let btn = x;
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
    setCurrent(index) {
        if (this.buttons.length == 0) {
            return;
        }
        const old = this.buttons[this.current].GetComponent($typeof(Image));
        //old.enabled = true;
        // old.sprite = this.normalImg;
        // old.color = this.normalColor;
        this.buttons[this.current].GetComponent($typeof(LayoutElement)).minWidth = 129;
        this.buttons[this.current].GetComponent($typeof(LayoutElement)).minHeight = 0;
        let oldIcon = old.transform.Find("Image").GetComponent($typeof(RectTransform));
        this.buttons[this.current].GetComponentInChildren($typeof(TMP_Text), true).DOFade(0, 0); //.gameObject.SetActive(false);
        //oldIcon.localScale = new Vector3(1, 1, 1);
        oldIcon.DOScale(new Vector3(1, 1, 1), 0.2);
        //oldIcon.anchoredPosition = new Vector2(0, 5);
        oldIcon.DOAnchorPos(new Vector2(0, 5), 0.2);
        const target = this.buttons[index].GetComponent($typeof(Image));
        //target.enabled = false;
        // target.sprite = this.currentImg;
        // target.color = this.currentColor;
        let targetIcon = target.transform.Find("Image").GetComponent($typeof(RectTransform));
        //targetIcon.localScale = new Vector3(1.2, 1.2, 1);
        targetIcon.DOScale(new Vector3(1.2, 1.2, 1), 0.2);
        //targetIcon.anchoredPosition = new Vector2(0, 42);
        targetIcon.DOAnchorPos(new Vector2(0, 42), 0.2);
        this.buttons[index].GetComponent($typeof(LayoutElement)).minWidth = 200;
        this.buttons[index].GetComponent($typeof(LayoutElement)).minHeight = 180;
        this.buttons[index].GetComponentInChildren($typeof(TMP_Text), true).DOFade(1, 0.2); //.gameObject.SetActive(true);
        const bgRect = this.bg.GetComponent($typeof(RectTransform));
        const rect = this.buttons[index].GetComponent($typeof(RectTransform));
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
export const self = global.$Navbar ?? (global.$Navbar = new Navbar());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2YmFyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvTWFpbi9OYXZiYXIubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMvQyxJQUFPLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzlCLElBQU8sTUFBTSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUN6QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDL0MsSUFBTyxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBR3ZDLElBQU8sYUFBYSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQztBQUN2RCxJQUFPLGFBQWEsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQztBQUNwRCxJQUFPLE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztBQUN4QyxJQUFPLE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztBQUN4QyxJQUFPLFFBQVEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztBQVNwQyxNQUFNLE9BQU8sTUFBTyxTQUFRLFFBQVE7SUFBcEM7O1FBS1ksWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixZQUFPLEdBQVcsQ0FBQyxDQUFDO0lBOEVoQyxDQUFDO0lBM0VHLElBQUk7UUFFQSxFQUFFO1FBQ0YsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFF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