import { StateFsm } from "Common/StateFsm.mjs";
import { Start } from "Game/HpSlider/Start.mjs";
export class HpSlider extends StateFsm {
    Start;
    init() {
        this.Start = new Start(this);
        console.log("init HpSlider");
    }
}
export const self = global.$HpSlider ??= new HpSlider();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHBTbGlkZXIubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9HYW1lL0hwU2xpZGVyLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRTlDLE1BQU0sT0FBTyxRQUFTLFNBQVEsUUFBUTtJQUNsQyxLQUFLLENBQVE7SUFFYixJQUFJO1FBQ0EsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FDSjtBQUVELE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBYSxNQUFNLENBQUMsU0FBUyxLQUFLLElBQUksUUFBUSxFQUFFLENBQUMifQ==