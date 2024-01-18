import { StateFsm } from "Common/StateFsm.mjs";
import { MenuAreaStart } from "Main/MenuArea/MenuAreaStart.mjs";
var $typeof = puer.$typeof;
var HorizontalScrollSnap = CS.UnityEngine.UI.Extensions.HorizontalScrollSnap;
var ScrollRect = CS.UnityEngine.UI.ScrollRect;
export class MenuArea extends StateFsm {
    snap;
    characterSample;
    MenuAreaStart;
    init() {
        this.MenuAreaStart = this.bind(MenuAreaStart);
        this.characterSample.SetActive(false);
        //
        this.snap = this.fsm.agent.GetComponent($typeof(HorizontalScrollSnap));
        this.snap.OnSelectionPageChangedEvent.AddListener(index => {
            //console.log(`page: ${index}`);
            $Navbar.setCurrent(index);
            this.characterSample.SetActive(index == 1);
        });
        const scroll = this.snap.GetComponent($typeof(ScrollRect));
        scroll.onValueChanged.AddListener(value => {
            //console.log(value.x, value.y);
        });
        //let rt = (this.snap.GetComponent($typeof(ScrollRect)) as ScrollRect).content.GetComponent($typeof(RectTransform)) as RectTransform;
        //rt.sizeDelta = new Vector2(3600, rt.sizeDelta.y);
        this.snap.GoToScreen(2);
    }
}
export const self = global.$MenuArea ??= new MenuArea();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVudUFyZWEubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9NYWluL01lbnVBcmVhLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQzlELElBQU8sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDOUIsSUFBTyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUM7QUFDaEYsSUFBTyxVQUFVLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO0FBS2pELE1BQU0sT0FBTyxRQUFTLFNBQVEsUUFBUTtJQUNsQyxJQUFJLENBQXVCO0lBQzNCLGVBQWUsQ0FBYTtJQUM1QixhQUFhLENBQWdCO0lBRTdCLElBQUk7UUFDQSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsRUFBRTtRQUNGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUF5QixDQUFDO1FBQy9GLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3RELGdDQUFnQztZQUNoQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBZSxDQUFDO1FBQ3pFLE1BQU0sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3RDLGdDQUFnQztRQUNwQyxDQUFDLENBQUMsQ0FBQztRQUNKLHFJQUFxSTtRQUNySSxtREFBbUQ7UUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNKO0FBRUQsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFhLE1BQU0sQ0FBQyxTQUFTLEtBQUssSUFBSSxRQUFRLEVBQUUsQ0FBQyJ9