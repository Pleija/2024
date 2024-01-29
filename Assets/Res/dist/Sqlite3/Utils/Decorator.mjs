/**元数据存储 */
class Metadata {
    _info;
    _decorator;
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
    /**装饰信息存储 */
    static actor = new WeakMap();
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
/** 字段/方法修饰器 */
class FieldMetadata {
    /**装饰信息存储 */
    static actor = new WeakMap();
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
export { Metadata, ClassMetadata, FieldMetadata };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb3JhdG9yLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3FsaXRlMy9VdGlscy9EZWNvcmF0b3IubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVc7QUFDWCxNQUFNLFFBQVE7SUFDRixLQUFLLENBQU07SUFDWCxVQUFVLENBQVc7SUFDN0IsSUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUFBLENBQUM7SUFDbEMsSUFBSSxTQUFTLEtBQUssT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUFBLENBQUM7SUFDNUMsWUFBWSxTQUFtQixFQUFFLElBQVU7UUFDdkMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFDaEMsQ0FBQztDQUNKO0FBRUQsV0FBVztBQUNYLE1BQU0sYUFBYTtJQUNmLFlBQVk7SUFDSixNQUFNLENBQVUsS0FBSyxHQUFnQyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBRTNFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBZ0IsRUFBRSxRQUFrQjtRQUMzQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDYixTQUFTLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBZ0IsRUFBRSxTQUFrQixFQUFFLE9BQWlCO1FBQzlELElBQUksU0FB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