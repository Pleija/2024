import { Enumerable } from "./Enumerable";
export class SelectManyEnumerable extends Enumerable {
    constructor(parent, selector) {
        super();
        this.parent = parent;
        this.selector = selector;
    }
    *generator() {
        for (const value1 of this.parent) {
            const values = this.selector(value1);
            if (values) {
                for (const value of values) {
                    yield value;
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0TWFueUVudW1lcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRW51bWVyYWJsZS9TZWxlY3RNYW55RW51bWVyYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTFDLE1BQU0sT0FBTyxvQkFBdUMsU0FBUSxVQUFhO0lBQ3JFLFlBQStCLE1BQXFCLEVBQXFCLFFBQTRDO1FBQ2pILEtBQUssRUFBRSxDQUFDO1FBRG1CLFdBQU0sR0FBTixNQUFNLENBQWU7UUFBcUIsYUFBUSxHQUFSLFFBQVEsQ0FBb0M7SUFFckgsQ0FBQztJQUNTLENBQUMsU0FBUztRQUNoQixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMvQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1QsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztvQkFDekIsTUFBTSxLQUFLLENBQUM7Z0JBQ2hCLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9