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
    currentImg;
    currentColor;
    normalImg;
    normalColor;
    buttons = new Array(4);
    current = 2;
    bg;
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
        this.fsm.agent.OnEnableAsObservable().Subscribe(() => {
            console.log("Navbar enable");
        });
        // todo: 没用, 因为 jsEnv已经被销毁了
        // (this.fsm.agent.OnDisableAsObservable() as  Subject$1<Unit>).Subscribe(()=> {
        //     console.log("Navbar disable");
        // });
    }
    setCurrent(index) {
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
export const self = global.$Navbar ??= new Navbar();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2YmFyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvTWFpbi9OYXZiYXIubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxJQUFPLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzlCLElBQU8sTUFBTSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUN6QyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsSUFBTyxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBR3ZDLElBQU8sYUFBYSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQztBQUN2RCxJQUFPLGFBQWEsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQztBQUNwRCxJQUFPLE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztBQUN4QyxJQUFPLE9BQU8sR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztBQUN4QyxJQUFPLFFBQVEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztBQVFwQyxNQUFNLE9BQU8sTUFBTyxTQUFRLFFBQVE7SUFDaEMsVUFBVSxDQUFTO0lBQ25CLFlBQVksQ0FBUTtJQUNwQixTQUFTLENBQVM7SUFDbEIsV0FBVyxDQUFRO0lBQ1gsT0FBTyxHQUFhLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLE9BQU8sR0FBVyxDQUFDLENBQUM7SUFDNUIsRUFBRSxDQUFZO0lBRWQsSUFBSTtRQUNBLEVBQUU7UUFDRixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVC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