/**元数据存储 */
class Metadata {
    get info() { return this._info; }
    ;
    get decorator() { return this._decorator; }
    ;
    constructor(decorator, info) {
        this._info = info;
        this._decorator = decorator;
    }
}
/** 类修饰器 */
class ClassMetadata {
    static add(target, metadata) {
        let metadatas = this.actor.get(target);
        if (!metadatas) {
            metadatas = new Array();
            this.actor.set(target, metadatas);
        }
        metadatas.push(metadata);
    }
    static get(target, decorator, inherit) {
        let metadatas = this.actor.get(target);
        if (metadatas && metadatas.length > 0) {
            //限定修饰标签
            if (decorator) {
                let _metadatas = new Array();
                metadatas.forEach(metadata => {
                    if (metadata.decorator === decorator)
                        _metadatas.push(metadata);
                });
                metadatas = _metadatas.length > 0 ? _metadatas : undefined;
            }
            return metadatas;
        }
        //基类信息
        if (inherit) {
            let _super = Object.getPrototypeOf(target);
            if (typeof (_super) === "function" && _super !== Function && _super !== Object && _super.name.length > 0) {
                return this.get(_super, decorator, inherit);
            }
        }
        return undefined;
    }
    static getFirst(target, decorator, inherit) {
        let metadatas = this.get(target, decorator, inherit);
        if (metadatas && metadatas.length > 0)
            return metadatas[0];
        return undefined;
    }
}
/**装饰信息存储 */
ClassMetadata.actor = new WeakMap();
/** 字段/方法修饰器 */
class FieldMetadata {
    static add(target, key, metadata) {
        let fields = this.actor.get(target);
        if (!fields) {
            fields = new Map();
            this.actor.set(target, fields);
        }
        let metadatas = fields.get(key);
        if (!metadatas) {
            metadatas = new Array();
            fields.set(key, metadatas);
        }
        metadatas.push(metadata);
    }
    static get(target, key, decorator, inherit) {
        let fields = this.actor.get(target);
        if (fields) {
            let metadatas = fields.get(key);
            if (metadatas && metadatas.length > 0) {
                //限定修饰标签
                if (decorator) {
                    let _metadatas = new Array();
                    metadatas.forEach(metadata => {
                        if (metadata.decorator === decorator)
                            _metadatas.push(metadata);
                    });
                    metadatas = _metadatas.length > 0 ? _metadatas : undefined;
                }
                return metadatas;
            }
        }
        //基类信息
        if (inherit) {
            let _super = Object.getPrototypeOf(target);
            if (typeof (_super) === "function" && _super !== Function && _super !== Object && _super.name.length > 0) {
                return this.get(_super, key, decorator, inherit);
            }
        }
        return undefined;
    }
    static getFirst(target, key, decorator, inherit) {
        let metadatas = this.get(target, key, decorator, inherit);
        if (metadatas && metadatas.length > 0)
            return metadatas[0];
        return undefined;
    }
    static getFields(target, inherit) {
        let keys = new Array();
        let fields = this.actor.get(target);
        if (fields) {
            keys.push(...fields.keys());
        }
        //基类信息
        if (inherit) {
            let _super = Object.getPrototypeOf(target);
            if (typeof (_super) === "function" && _super !== Function && _super !== Object && _super.name.length > 0) {
                //读取基类字段
                for (let _k1 of this.getFields(_super, inherit).reverse()) {
                    let add = true;
                    for (let _k2 of keys) {
                        if (_k1 === _k2) {
                            add = false;
                            break;
                        }
                    }
                    if (add)
                        keys.unshift(_k1);
                }
            }
        }
        return keys;
    }
}
/**装饰信息存储 */
FieldMetadata.actor = new WeakMap();
export { Metadata, ClassMetadata, FieldMetadata };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb3JhdG9yLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvVXRpbHMvRGVjb3JhdG9yLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXO0FBQ1gsTUFBTSxRQUFRO0lBR1YsSUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUFBLENBQUM7SUFDbEMsSUFBSSxTQUFTLEtBQUssT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUFBLENBQUM7SUFDNUMsWUFBWSxTQUFtQixFQUFFLElBQVU7UUFDdkMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFDaEMsQ0FBQztDQUNKO0FBRUQsV0FBVztBQUNYLE1BQU0sYUFBYTtJQUlmLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBZ0IsRUFBRSxRQUFrQjtRQUMzQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDYixTQUFTLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBZ0IsRUFBRSxTQUFrQixFQUFFLE9BQWlCO1FBQzlELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksU0FBUyxJQUFJLFNBQVMs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