import { Enumerable } from "./Enumerable";
export class TakeEnumerable extends Enumerable {
    constructor(parent, takeCount) {
        super();
        this.parent = parent;
        this.takeCount = takeCount;
    }
    *generator() {
        let index = 0;
        for (const value of this.parent) {
            yield value;
            if (++index >= this.takeCount) {
                break;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFrZUVudW1lcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRW51bWVyYWJsZS9UYWtlRW51bWVyYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTFDLE1BQU0sT0FBTyxjQUF3QixTQUFRLFVBQWE7SUFDdEQsWUFBK0IsTUFBcUIsRUFBcUIsU0FBaUI7UUFDdEYsS0FBSyxFQUFFLENBQUM7UUFEbUIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUFxQixjQUFTLEdBQVQsU0FBUyxDQUFRO0lBRTFGLENBQUM7SUFDUyxDQUFDLFNBQVM7UUFDaEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUIsTUFBTSxLQUFLLENBQUM7WUFDWixJQUFJLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDNUIsTUFBTTtZQUNWLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=