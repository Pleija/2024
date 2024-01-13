import { StateNode } from "Common/StateNode.mjs";
var $typeof = puer.$typeof;
var RadialSlider = CS.UnityEngine.UI.Extensions.RadialSlider;
var TMP_Text = CS.TMPro.TMP_Text;
export class Start extends StateNode {
    init() {
    }
    enter() {
        const rs = this.agent.GetComponentInChildren($typeof(RadialSlider));
        rs.Value = 1;
        const text = this.agent.GetComponentInChildren($typeof(TMP_Text));
        text.text = `${100}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnQubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9HYW1lL0hwU2xpZGVyL1N0YXJ0Lm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDakQsSUFBTyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUM5QixJQUFPLFlBQVksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO0FBQ2hFLElBQU8sUUFBUSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0FBRXBDLE1BQU0sT0FBTyxLQUFNLFNBQVEsU0FBbUI7SUFFMUMsSUFBSTtJQUVKLENBQUM7SUFFRCxLQUFLO1FBQ0YsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQWtCLENBQUM7UUFDckYsRUFBRSxDQUFDLEtBQUssR0FBRSxDQUFDLENBQUM7UUFDWixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBYyxDQUFDO1FBQy9FLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUN4QixDQUFDO0NBQ0oifQ==