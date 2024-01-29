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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXBlZEVudW1lcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9FbnVtZXJhYmxlL0dyb3VwZWRFbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBR3ZELE1BQU0sT0FBTyxpQkFBd0IsU0FBUSxVQUFhO0lBQ3RELElBQVcsV0FBVztRQUNsQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsSUFBYyxXQUFXO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDbkMsQ0FBQztJQUNELFlBQStCLE1BQStCLEVBQWtCLEdBQU0sRUFBWSxLQUF1QjtRQUNySCxLQUFLLEVBQUUsQ0FBQztRQURtQixXQUFNLEdBQU4sTUFBTSxDQUF5QjtRQUFrQixRQUFHLEdBQUgsR0FBRyxDQUFHO1FBQVksVUFBSyxHQUFMLEtBQUssQ0FBa0I7UUFHakgsaUJBQVksR0FBRyxFQUFFLENBQUM7SUFEMUIsQ0FBQztJQUVNLFNBQVMsQ0FBQyxLQUFRO1FBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDUyxDQUFDLFNBQVM7UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxTQUFVLENBQUM7WUFDUCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUNqQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLEtBQUssRUFBRSxDQUFDO2dCQUN0QyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBQ0QsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDVCxNQUFNO1lBQ1YsQ0FBQztZQUVELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1YsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RDLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzVCLENBQUM7cUJBQ0ksQ0FBQztvQkFDRixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO1lBQ0wsQ0FBQztpQkFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDakMsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=