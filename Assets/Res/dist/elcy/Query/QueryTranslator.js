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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlUcmFuc2xhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1F1ZXJ5L1F1ZXJ5VHJhbnNsYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFZQSxNQUFNLE9BQU8sZUFBZTtJQUN4QixZQUFtQixHQUFXO1FBQVgsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUNwQixjQUFTLEdBQXNCLEVBQUUsQ0FBQztRQUNwQyxTQUFJLEdBQUcsSUFBSSxHQUFHLEVBQWdELENBQUM7SUFGckMsQ0FBQztJQUc1QixpQkFBaUIsQ0FBQyxHQUFHLFNBQTRCO1FBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNNLFVBQVUsQ0FBNEMsRUFBMkIsRUFBRSxTQUFtRixFQUFFLGNBQWMsQ0FBQyxHQUFTLEVBQUUsRUFBRSxDQUFDLEtBQUs7UUFDN00sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1AsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNULElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQ0QsTUFBTSxhQUFhLEdBQXlCO1lBQ3hDLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLFdBQVcsRUFBRSxXQUFXO1NBQzNCLENBQUM7UUFDRixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDO0lBQzVCLENBQUM7SUFDTSxjQUFjLENBQWtFLE1BQVMsRUFBRSxVQUFhLEVBQUUsU0FBbUYsRUFBRSxjQUFjLENBQUMsR0FBUyxFQUFFLEVBQUUsQ0FBQyxLQUFLO1FBQ3BPLElBQUksR0FBRyxHQUFH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