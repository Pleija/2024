import { isNull } from "../Helper/Util";
export const keyComparer = (a, b) => {
    let result = a === b;
    if (!result && !isNull(a) && !isNull(b) && a instanceof Object && b instanceof Object) {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        result = aKeys.length === bKeys.length;
        if (result) {
            result = aKeys.all((o) => b.hasOwnProperty(o) && b[o] === a[o]);
        }
    }
    return result;
};
export class Enumerable {
    set enableCache(value) {
        if (this.parent) {
            this.cache.enabled = value;
            if (!value) {
                this.cache.result = null;
            }
        }
    }
    get enableCache() {
        return !this.parent || this.cache.enabled;
    }
    constructor(source) {
        this.cache = {};
        if (source) {
            if (Array.isArray(source)) {
                this.cache.result = source;
                this.cache.enabled = true;
                this.cache.isDone = true;
            }
            else {
                let iterable = null;
                if (source[Symbol.iterator]) {
                    iterable = source;
                }
                else {
                    iterable = {
                        [Symbol.iterator]() {
                            return source();
                        }
                    };
                }
                this.parent = iterable;
            }
        }
    }
    static from(source) {
        return source instanceof Enumerable ? source : new Enumerable(source);
    }
    static range(start, end, step = 1) {
        return new Enumerable(function* () {
            while (start <= end) {
                yield start;
                start += step;
            }
        });
    }
    [Symbol.iterator]() {
        if (this.enableCache) {
            return this.cachedGenerator();
        }
        return this.generator();
    }
    all(predicate) {
        for (const item of this) {
            if (!predicate(item)) {
                return false;
            }
        }
        return true;
    }
    any(predicate) {
        for (const item of this) {
            if (!predicate || predicate(item)) {
                return true;
            }
        }
        return false;
    }
    avg(selector) {
        let sum = 0;
        let count = 0;
        for (const item of this) {
            sum += selector ? selector(item) : item;
            count++;
        }
        return sum / count;
    }
    contains(item) {
        for (const it of this) {
            if (it === item) {
                return true;
            }
        }
        return false;
    }
    count(predicate) {
        let count = 0;
        for (const item of this) {
            if (!predicate || predicate(item)) {
                count++;
            }
        }
        return count;
    }
    // Helper extension
    each(executor) {
        let index = 0;
        for (const item of this) {
            executor(item, index++);
        }
    }
    first(predicate) {
        for (const item of this) {
            if (!predicate || predicate(item)) {
                return item;
            }
        }
        return null;
    }
    max(selector) {
        let max = -Infinity;
        for (const item of this) {
            const num = selector ? selector(item) : item;
            if (max < num) {
                max = num;
            }
        }
        return max;
    }
    min(selector) {
        let min = Infinity;
        for (const item of this) {
            const num = selector ? selector(item) : item;
            if (!min || min > num) {
                min = num;
            }
        }
        return min;
    }
    ofType(type) {
        return this.where((o) => o instanceof type);
    }
    reduce(seedOrFunc, func) {
        let accumulated;
        if (func) {
            accumulated = seedOrFunc;
        }
        else {
            func = seedOrFunc;
        }
        for (const a of this) {
            accumulated = func(accumulated, a);
        }
        return accumulated;
    }
    sum(selector) {
        let sum = 0;
        for (const item of this) {
            sum += selector ? selector(item) : item;
        }
        return sum;
    }
    toArray() {
        if (this.enableCache && this.cache.isDone) {
            return this.cache.result.slice(0);
        }
        return Array.from(this);
    }
    toMap(keySelector, valueSelector) {
        const rel = new Map();
        for (const i of this) {
            rel.set(keySelector(i), valueSelector ? valueSelector(i) : i);
        }
        return rel;
    }
    *generator() {
        for (const value of this.parent) {
            yield value;
        }
    }
    *cachedGenerator() {
        if (this.cache.isDone) {
            yield* this.cache.result;
            return;
        }
        if (!this.cache.iterator) {
            this.cache.iterator = this.generator();
            this.cache.result = [];
        }
        else if (!this.cache.result) {
            this.cache.result = [];
        }
        const iterator = this.cache.iterator;
        if (iterator && !iterator._accessCount) {
            iterator._accessCount = 0;
        }
        iterator._accessCount++;
        try {
            let index = 0;
            for (;;) {
                const isDone = this.cache.isDone;
                const len = this.cache.result.length;
                while (len > index) {
                    yield this.cache.result[index++];
                }
                if (isDone) {
                    break;
                }
                const a = iterator.next();
                if (!a.done) {
                    this.cache.result.push(a.value);
                }
                else if (!this.cache.isDone) {
                    this.cache.isDone = true;
                }
            }
        }
        finally {
            iterator._accessCount--;
            if (iterator.return && iterator._accessCount <= 0) {
                iterator.return();
                if (this.cache.iterator === iterator) {
                    this.cache.iterator = null;
                }
            }
        }
    }
}
import "./Enumerable.partial";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0VudW1lcmFibGUvRW51bWVyYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHeEMsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQVUsQ0FBSSxFQUFFLENBQUksRUFBRSxFQUFFO0lBQy9DLElBQUksTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckIsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksTUFBTSxJQUFJLENBQUMsWUFBWSxNQUFNLEVBQUUsQ0FBQztRQUNwRixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBbUIsQ0FBQztRQUMvQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBbUIsQ0FBQztRQUMvQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3ZDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDVCxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEUsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUM7QUFDRixNQUFNLE9BQU8sVUFBVTtJQUNuQixJQUFXLFdBQVcsQ0FBQyxLQUFLO1FBQ3hCLElBQUksSUFBSSxDQUFDLE1B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