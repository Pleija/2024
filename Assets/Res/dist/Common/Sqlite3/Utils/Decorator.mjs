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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb3JhdG9yLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvVXRpbHMvRGVjb3JhdG9yLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXO0FBQ1gsTUFBTSxRQUFRO0lBQ0YsS0FBSyxDQUFNO0lBQ1gsVUFBVSxDQUFXO0lBQzdCLElBQUksSUFBSSxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFBQSxDQUFDO0lBQ2xDLElBQUksU0FBUyxLQUFLLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFBQSxDQUFDO0lBQzVDLFlBQVksU0FBbUIsRUFBRSxJQUFVO1FBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQ2hDLENBQUM7Q0FDSjtBQUVELFdBQVc7QUFDWCxNQUFNLGFBQWE7SUFDZixZQUFZO0lBQ0osTUFBTSxDQUFVLEtBQUssR0FBZ0MsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQUUzRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQWdCLEVBQUUsUUFBa0I7UUFDM0MsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNaLFNBQVMsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztTQUNyQztRQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBZ0IsRUFBRSxTQUFrQixFQUFFLE9BQWlCO1FBQzlELElBQUksU0FB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