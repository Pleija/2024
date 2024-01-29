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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9FbnVtZXJhYmxlL0VudW1lcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3hDLE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxDQUFVLENBQUksRUFBRSxDQUFJLEVBQUUsRUFBRTtJQUMvQyxJQUFJLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLE1BQU0sSUFBSSxDQUFDLFlBQVksTUFBTSxFQUFFLENBQUM7UUFDcEYsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQW1CLENBQUM7UUFDL0MsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQW1CLENBQUM7UUFDL0MsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUN2QyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1QsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDO0FBQ0YsTUFBTSxPQUFPLFVBQVU7SUFDbkIsSUFBVyxXQUFXLENBQUMsS0FBSztRQUN4QixJQUFJLElBQUksQ0FBQyxN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