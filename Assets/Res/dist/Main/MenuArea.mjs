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
        this.MenuAreaStart = new MenuAreaStart(this);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVudUFyZWEubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9NYWluL01lbnVBcmVhLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQzlELElBQU8sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDOUIsSUFBTyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUM7QUFDaEYsSUFBTyxVQUFVLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO0FBS2pELE1BQU0sT0FBTyxRQUFTLFNBQVEsUUFBUTtJQUNsQyxJQUFJLENBQXVCO0lBQzNCLGVBQWUsQ0FBYTtJQUM1QixhQUFhLENBQWdCO0lBRTdCLElBQUk7UUFDQSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLEVBQUU7UUFDRixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBeUIsQ0FBQztRQUMvRixJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0RCxnQ0FBZ0M7WUFDaEMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQWUsQ0FBQztRQUN6RSxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0QyxnQ0FBZ0M7UUFDcEMsQ0FBQyxDQUFDLENBQUM7UUFDSixxSUFBcUk7UUFDckksbURBQW1EO1FBQ2xELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVCLENBQUM7Q0FDSjtBQUVELE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBYSxNQUFNLENBQUMsU0FBUyxLQUFLLElBQUksUUFBUSxFQUFFLENBQUMifQ==