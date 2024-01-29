import { Enumerable } from "./Enumerable";
export class SkipEnumerable extends Enumerable {
    constructor(parent, skipCount) {
        super();
        this.parent = parent;
        this.skipCount = skipCount;
    }
    *generator() {
        let index = 0;
        for (const value of this.parent) {
            if (index++ < this.skipCount) {
                continue;
            }
            yield value;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2tpcEVudW1lcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRW51bWVyYWJsZS9Ta2lwRW51bWVyYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTFDLE1BQU0sT0FBTyxjQUF3QixTQUFRLFVBQWE7SUFDdEQsWUFBK0IsTUFBcUIsRUFBcUIsU0FBaUI7UUFDdEYsS0FBSyxFQUFFLENBQUM7UUFEbUIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUFxQixjQUFTLEdBQVQsU0FBUyxDQUFRO0lBRTFGLENBQUM7SUFDUyxDQUFDLFNBQVM7UUFDaEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUIsSUFBSSxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzNCLFNBQVM7WUFDYixDQUFDO1lBQ0QsTUFBTSxLQUFLLENBQUM7UUFDaEIsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9