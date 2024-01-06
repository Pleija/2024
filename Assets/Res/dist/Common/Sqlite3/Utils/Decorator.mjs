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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb3JhdG9yLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvVXRpbHMvRGVjb3JhdG9yLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXO0FBQ1gsTUFBTSxRQUFRO0lBQ0YsS0FBSyxDQUFNO0lBQ1gsVUFBVSxDQUFXO0lBQzdCLElBQUksSUFBSSxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFBQSxDQUFDO0lBQ2xDLElBQUksU0FBUyxLQUFLLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFBQSxDQUFDO0lBQzVDLFlBQVksU0FBbUIsRUFBRSxJQUFVO1FBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQ2hDLENBQUM7Q0FDSjtBQUVELFdBQVc7QUFDWCxNQUFNLGFBQWE7SUFDZixZQUFZO0lBQ0osTUFBTSxDQUFVLEtBQUssR0FBZ0MsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQUUzRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQWdCLEVBQUUsUUFBa0I7UUFDM0MsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2IsU0FBUyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDRCxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQWdCLEVBQUUsU0FBa0IsRUFBRSxPQUFpQjtRQUM5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