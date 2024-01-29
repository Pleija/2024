import { Enumerable } from "./Enumerable";
import { defaultResultFn } from "./InnerJoinEnumerable";
export class LeftJoinEnumerable extends Enumerable {
    constructor(parent, parent2, relation, resultSelector = defaultResultFn) {
        super();
        this.parent = parent;
        this.parent2 = parent2;
        this.relation = relation;
        this.resultSelector = resultSelector;
    }
    *generator() {
        for (const value1 of this.parent) {
            let hasMatch = false;
            for (const value2 of this.parent2) {
                if (this.relation(value1, value2)) {
                    hasMatch = true;
                    yield this.resultSelector(value1, value2);
                }
            }
            if (!hasMatch) {
                yield this.resultSelector(value1, null);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVmdEpvaW5FbnVtZXJhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0VudW1lcmFibGUvTGVmdEpvaW5FbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRXhELE1BQU0sT0FBTyxrQkFBK0MsU0FBUSxVQUFhO0lBQzdFLFlBQStCLE1BQXFCLEVBQXFCLE9BQXVCLEVBQXFCLFFBQXlDLEVBQXFCLGlCQUFvRCxlQUFlO1FBQ2xQLEtBQUssRUFBRSxDQUFDO1FBRG1CLFdBQU0sR0FBTixNQUFNLENBQWU7UUFBcUIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7UUFBcUIsYUFBUSxHQUFSLFFBQVEsQ0FBaUM7UUFBcUIsbUJBQWMsR0FBZCxjQUFjLENBQXFEO0lBRXRQLENBQUM7SUFDUyxDQUFDLFNBQVM7UUFDaEIsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDL0IsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ2hDLFFBQVEsR0FBRyxJQUFJLENBQUM7b0JBQ2hCLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzlDLENBQUM7WUFDTCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNaLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDNUMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==