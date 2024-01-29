export class QueryTranslator {
    constructor(key) {
        this.key = key;
        this.fallbacks = [];
        this._map = new Map();
    }
    registerFallbacks(...fallbacks) {
        this.fallbacks = this.fallbacks.concat(fallbacks);
    }
    registerFn(fn, translate, isTranslate = (exp) => false) {
        let map = this._map.get(fn);
        if (!map) {
            map = {};
            this._map.set(fn, map);
        }
        const translateItem = {
            translate: translate,
            isTranslate: isTranslate
        };
        map[""] = translateItem;
    }
    registerMember(object, memberName, translate, isTranslate = (exp) => false) {
        let map = this._map.get(object);
        if (!map) {
            map = {};
            this._map.set(object, map);
        }
        const translateItem = {
            translate: translate,
            isTranslate: isTranslate
        };
        map[memberName] = translateItem;
    }
    registerMethod(object, methodName, translate, isTranslate = (exp) => false) {
        let map = this._map.get(object);
        if (!map) {
            map = {};
            this._map.set(object, map);
        }
        const translateItem = {
            translate: translate,
            isTranslate: isTranslate
        };
        map[methodName] = translateItem;
    }
    registerOperator(operator, translate, isTranslate = (exp) => false) {
        let map = this._map.get(operator);
        if (!map) {
            map = {};
            this._map.set(operator, map);
        }
        const translateItem = {
            translate: translate,
            isTranslate: isTranslate
        };
        map[""] = translateItem;
    }
    registerType(type, translate, isTranslate = (exp) => false) {
        let map = this._map.get(type);
        if (!map) {
            map = {};
            this._map.set(type, map);
        }
        const translateItem = {
            translate: translate,
            isTranslate: isTranslate
        };
        map[""] = translateItem;
    }
    resolve(object, memberName) {
        const map = this._map.get(object);
        let item = map && map[memberName || ""];
        if (item === undefined) {
            for (const fallback of this.fallbacks) {
                item = fallback.resolve(object, memberName);
                if (item) {
                    break;
                }
            }
        }
        return item;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlUcmFuc2xhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUXVlcnkvUXVlcnlUcmFuc2xhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVlBLE1BQU0sT0FBTyxlQUFlO0lBQ3hCLFlBQW1CLEdBQVc7UUFBWCxRQUFHLEdBQUgsR0FBRyxDQUFRO1FBQ3BCLGNBQVMsR0FBc0IsRUFBRSxDQUFDO1FBQ3BDLFNBQUksR0FBRyxJQUFJLEdBQUcsRUFBZ0QsQ0FBQztJQUZyQyxDQUFDO0lBRzVCLGlCQUFpQixDQUFDLEdBQUcsU0FBNEI7UUFDcEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ00sVUFBVSxDQUE0QyxFQUEyQixFQUFFLFNBQW1GLEVBQUUsY0FBYyxDQUFDLEdBQVMsRUFBRSxFQUFFLENBQUMsS0FBSztRQUM3TSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDUCxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFDRCxNQUFNLGFBQWEsR0FBeUI7WUFDeEMsU0FBUyxFQUFFLFNBQVM7WUFDcEIsV0FBVyxFQUFFLFdBQVc7U0FDM0IsQ0FBQztRQUNGLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUM7SUFDNUIsQ0FBQztJQUNNLGNBQWMsQ0FBa0UsTUFBUyxFQUFFLFVBQWEsRUFBRSxTQUFtRixFQUFFLGNBQWMsQ0FBQyxHQUFTLEVBQUUsRUFBRSxDQUFDLEtBQUs7UUFDcE8sSUFBSSxHQUFHLEdBQUcs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