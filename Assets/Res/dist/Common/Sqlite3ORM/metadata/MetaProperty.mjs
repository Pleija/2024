import { DEFAULT_VALUE_TRANSFORMERS } from './DefaultValueTransformers.mjs';
import { PropertyType } from './PropertyType.mjs';
export class MetaProperty {
    className;
    key;
    /**
     * The property type enum mapped to this field
     */
    _propertyType;
    get propertyType() {
        return this._propertyType;
    }
    _field;
    get field() {
        /* istanbul ignore else */
        if (this._field) {
            return this._field;
        }
        /* istanbul ignore next */
        throw new Error(`meta model property '${this.className}.${this.key.toString()}' not fully initialized yet`);
    }
    _transform;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YVByb3BlcnR5Lm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vbWV0YWRhdGEvTWV0YVByb3BlcnR5Lm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUc1RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHbEQsTUFBTSxPQUFPLFlBQVk7SUEwQks7SUFBbUM7SUF6Qi9EOztPQUVHO0lBQ0ssYUFBYSxDQUFlO0lBQ3BDLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBRU8sTUFBTSxDQUFTO0lBQ3ZCLElBQVcsS0FBSztRQUNkLDBCQUEwQjtRQUMxQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDcEI7UUFDRCwwQkFBMEI7UUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FDYix3QkFBd0IsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSw2QkFBNkIsQ0FDM0YsQ0FBQztJQUNKLENBQUM7SUFFTyxVQUFVLENBQW9CO0lBQ3RDLElBQVcsU0FBUztRQUNsQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDekIsQ0FBQztJQUVELFlBQTRCLFNBQWlCLEVBQWtCLEdBQVk7UUFBL0MsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFrQixRQUFHLEdBQUgsR0FBRyxDQUFTO1FBQ3pFLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQztJQUM1QyxDQUFDO0lBRUQsd0JBQXdCO0lBQ3hCLGVBQWUsQ0FBQyxZQUErQjtRQUM3QyxJQUFJLFFBQWdCLENBQUM7UUFDckIsMEJBQTBCO1FBQzFCLElB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