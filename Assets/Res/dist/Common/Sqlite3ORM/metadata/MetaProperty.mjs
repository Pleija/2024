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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YVByb3BlcnR5Lm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTNPUk0vbWV0YWRhdGEvTWV0YVByb3BlcnR5Lm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUc1RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHbEQsTUFBTSxPQUFPLFlBQVk7SUEwQks7SUFBbUM7SUF6Qi9EOztPQUVHO0lBQ0ssYUFBYSxDQUFlO0lBQ3BDLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBRU8sTUFBTSxDQUFTO0lBQ3ZCLElBQVcsS0FBSztRQUNkLDBCQUEwQjtRQUMxQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNoQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsQ0FBQztRQUNELDBCQUEwQjtRQUMxQixNQUFNLElBQUksS0FBSyxDQUNiLHdCQUF3QixJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLDZCQUE2QixDQUMzRixDQUFDO0lBQ0osQ0FBQztJQUVPLFVBQVUsQ0FBb0I7SUFDdEMsSUFBVyxTQUFTO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6QixDQUFDO0lBRUQsWUFBNEIsU0FBaUIsRUFBa0IsR0FBWTtRQUEvQyxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQWtCLFFBQUcsR0FBSCxHQUFHLENBQVM7UUFDekUsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDO0lBQzVDLENBQUM7SUFFRCx3QkFBd0I7SUFDeEIsZUFBZSxDQUFDLFlBQStCO1FBQzdDLElBQUksUUFBZ0IsQ0FBQztRQUNyQiwwQkFB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