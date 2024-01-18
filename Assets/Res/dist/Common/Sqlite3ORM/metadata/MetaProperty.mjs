import { DEFAULT_VALUE_TRANSFORMERS } from './DefaultValueTransformers.mjs';
import { PropertyType } from './PropertyType.mjs';
export class MetaProperty {
    get propertyType() {
        return this._propertyType;
    }
    get field() {
        /* istanbul ignore else */
        if (this._field) {
            return this._field;
        }
        /* istanbul ignore next */
        throw new Error(`meta model property '${this.className}.${this.key.toString()}' not fully initialized yet`);
    }
    get transform() {
        return this._transform;
    }
    constructor(className, key) {
        this.className = className;
        this.key = key;
        this._propertyType = PropertyType.UNKNOWN;
    }
    // called from decorator
    setPropertyType(propertyType) {
        let typeName;
        /* istanbul ignore else */
        if (typeof propertyType === 'function') {
            typeName = propertyType.name.toLowerCase();
        }
        else {
            typeName = propertyType.toLowerCase();
        }
        switch (typeName) {
            case 'boolean':
                this._propertyType = PropertyType.BOOLEAN;
                break;
            case 'string':
                this._propertyType = PropertyType.STRING;
                break;
            case 'number':
                this._propertyType = PropertyType.NUMBER;
                break;
            case 'date':
                this._propertyType = PropertyType.DATE;
                break;
            default:
                this._propertyType = PropertyType.UNKNOWN;
                break;
        }
    }
    valueToDB(value) {
        return this._transform.toDB(value);
    }
    getDBValueFromModel(model) {
        return this._transform.toDB(Reflect.get(model, this.key));
    }
    setDBValueIntoModel(model, value) {
        Reflect.set(model, this.key, this._transform.fromDB(value));
    }
    /**
     * Get the name for the corresponding host parameter
     *
     * @returns {string}
     */
    getHostParameterName(prefix) {
        prefix = prefix || '';
        return `:${prefix}${this.key.toString()}`;
    }
    init(model, name, isIdentity, opts) {
        try {
            this._field = model.table.getOrAddTableField(name, isIdentity, opts, this.propertyType);
        }
        catch (err) {
            throw new Error(`property '${this.className}.${this.key.toString()}': failed to add field: ${err.message}`);
        }
        // add mapping from column name to this property
        model.mapColNameToProp.set(this._field.name, this);
        // init transform
        const typeAffinity = this.field.dbTypeInfo.typeAffinity;
        if (opts.transform) {
            this._transform = opts.transform;
        }
        else {
            if (this.field.isJson) {
                this._transform = DEFAULT_VALUE_TRANSFORMERS.json;
            }
            else {
                switch (this.propertyType) {
                    /* BOOLEAN */
                    case PropertyType.BOOLEAN:
                        if (typeAffinity === 'TEXT') {
                            this._transform = DEFAULT_VALUE_TRANSFORMERS.booleanText;
                        }
                        else {
                            this._transform = DEFAULT_VALUE_TRANSFORMERS.booleanNumber;
                        }
                        break;
                    case PropertyType.DATE:
                        if (typeAffinity === 'TEXT') {
                            this._transform = DEFAULT_VALUE_TRANSFORMERS.dateText;
                        }
                        else {
                            if (this._field.dateInMilliSeconds) {
                                this._transform = DEFAULT_VALUE_TRANSFORMERS.dateIntegerAsMilliseconds;
                            }
                            else {
                                this._transform = DEFAULT_VALUE_TRANSFORMERS.dateIntegerAsSeconds;
                            }
                        }
                        break;
                    case PropertyType.NUMBER:
                        if (typeAffinity === 'TEXT') {
                            this._transform = DEFAULT_VALUE_TRANSFORMERS.numberText;
                        }
                        else {
                            this._transform = DEFAULT_VALUE_TRANSFORMERS.numberDefault;
                        }
                        break;
                    case PropertyType.STRING:
                        if (typeAffinity === 'TEXT') {
                            this._transform = DEFAULT_VALUE_TRANSFORMERS.stringDefault;
                        }
                        else {
                            this._transform = DEFAULT_VALUE_TRANSFORMERS.stringNumber;
                        }
                        break;
                    default:
                        this._transform = DEFAULT_VALUE_TRANSFORMERS.unknownDefault;
                        break;
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YVByb3BlcnR5Lm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vbWV0YWRhdGEvTWV0YVByb3BlcnR5Lm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUc1RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHbEQsTUFBTSxPQUFPLFlBQVk7SUFLdkIsSUFBSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVCLENBQUM7SUFHRCxJQUFXLEtBQUs7UUFDZCwwQkFBMEI7UUFDMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDaEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3JCLENBQUM7UUFDRCwwQkFBMEI7UUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FDYix3QkFBd0IsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSw2QkFBNkIsQ0FDM0YsQ0FBQztJQUNKLENBQUM7SUFHRCxJQUFXLFNBQVM7UUFDbEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxZQUE0QixTQUFpQixFQUFrQixHQUFZO1FBQS9DLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBa0IsUUFBRyxHQUFILEdBQUcsQ0FBUztRQUN6RSxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUM7SUFDNUMsQ0FBQztJQUVELHdCQUF3QjtJQUN4QixlQUFlLENBQUMsWUFBK0I7UUFDN0MsSUFBSSxRQUFnQixDQUFDO1FBQ3JCLDBCQUEwQjtRQUMxQixJQUFJLE9BQU8sWUFBWSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3ZDLFFBQVEsR0FBRyxZQUFZLENBQUMsSUFB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