import { Enumerable, keyComparer } from "./Enumerable";
export class GroupedEnumerable extends Enumerable {
    get enableCache() {
        return true;
    }
    get keySelector() {
        return this.parent.keySelector;
    }
    constructor(parent, key, cache) {
        super();
        this.parent = parent;
        this.key = key;
        this.cache = cache;
        this._cacheResult = [];
    }
    addResult(value) {
        this._cacheResult.push(value);
    }
    *generator() {
        if (!this.cache.result) {
            this.cache.result = [];
        }
        let index = 0;
        for (;;) {
            const isDone = this.cache.isDone;
            while (this._cacheResult.length > index) {
                yield this._cacheResult[index++];
            }
            if (isDone) {
                break;
            }
            const a = this.cache.iterator.next();
            if (!a.done) {
                const key = this.keySelector(a.value);
                if (keyComparer(this.key, key)) {
                    this.addResult(a.value);
                }
                else {
                    this.parent.addValue(key, a.value);
                }
            }
            else if (!this.cache.isDone) {
                this.cache.isDone = true;
                if (this.cache.iterator.return) {
                    this.cache.iterator.return();
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBlZEVudW1lcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvRW51bWVyYWJsZS9Hcm91cGVkRW51bWVyYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUd2RCxNQUFNLE9BQU8saUJBQXdCLFNBQVEsVUFBYTtJQUN0RCxJQUFXLFdBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNELElBQWMsV0FBVztRQUNyQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ25DLENBQUM7SUFDRCxZQUErQixNQUErQixFQUFrQixHQUFNLEVBQVksS0FBdUI7UUFDckgsS0FBSyxFQUFFLENBQUM7UUFEbUIsV0FBTSxHQUFOLE1BQU0sQ0FBeUI7UUFBa0IsUUFBRyxHQUFILEdBQUcsQ0FBRztRQUFZLFVBQUssR0FBTCxLQUFLLENBQWtCO1FBR2pILGlCQUFZLEdBQUcsRUFBRSxDQUFDO0lBRDFCLENBQUM7SUFFTSxTQUFTLENBQUMsS0FBUTtRQUNyQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQ1MsQ0FBQyxTQUFTO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsU0FBVSxDQUFDO1lBQ1AsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDakMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxLQUFLLEVBQUUsQ0FBQztnQkFDdEMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDckMsQ0FBQztZQUNELElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1QsTUFBTTtZQUNWLENBQUM7WUFFRCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNWLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzdCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM1QixDQUFDO3FCQUNJLENBQUM7b0JBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztZQUNMLENBQUM7aUJBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDekIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2pDLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9