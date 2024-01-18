import { backtickQuoteSimpleIdentifier } from '../utils/index.mjs';
import { DbCatalogDAO } from '../dbcatalog/index.mjs';
import { PropertyType } from './PropertyType.mjs';
import { schema } from './Schema.mjs';
/**
 * Class holding a field definition
 *
 * @export
 * @class Field
 */
export class Field {
    /**
     * The quoted field name
     */
    get quotedName() {
        return backtickQuoteSimpleIdentifier(this.name);
    }
    get dbDefaultType() {
        return this._dbDefaultType;
    }
    set dbDefaultType(dbType) {
        this._dbDefaultType = dbType;
        if (!this._dbtype) {
            this._dbTypeInfo = Field.parseDbType(this._dbDefaultType);
        }
    }
    get dbtype() {
        return this._dbtype ? this._dbtype : this.dbDefaultType;
    }
    set dbtype(dbType) {
        this._dbtype = dbType;
        this._dbTypeInfo = Field.parseDbType(this._dbtype);
    }
    get isDbTypeDefined() {
        return this._dbtype ? true : false;
    }
    get dbTypeInfo() {
        return this._dbTypeInfo;
    }
    get isJson() {
        return this._isJson == undefined ? false : this._isJson;
    }
    set isJson(isJson) {
        this._isJson = isJson;
    }
    get isIsJsonDefined() {
        return this._isJson == undefined ? false : true;
    }
    get dateInMilliSeconds() {
        return this._dateInMilliSeconds == undefined
            ? schema().dateInMilliSeconds
            : this._dateInMilliSeconds;
    }
    set dateInMilliSeconds(val) {
        this._dateInMilliSeconds = val;
    }
    get isDateInMilliSecondsDefined() {
        return this._dateInMilliSeconds == undefined ? false : true;
    }
    /**
     * Creates an instance of Field.
     *
     */
    constructor(name, isIdentity, opts, propertyType) {
        this.name = name;
        this.isIdentity = !!isIdentity;
        this.setDbDefaultType(propertyType, opts);
        if (opts) {
            if (opts.dbtype) {
                this.dbtype = opts.dbtype;
            }
            if (opts.isJson != undefined) {
                this._isJson = opts.isJson;
            }
            if (opts.dateInMilliSeconds != undefined) {
                this._dateInMilliSeconds = opts.dateInMilliSeconds;
            }
        }
    }
    setDbDefaultType(propertyType, opts) {
        switch (propertyType) {
            case PropertyType.BOOLEAN:
            case PropertyType.DATE:
                if (opts && opts.notNull) {
                    this.dbDefaultType = 'INTEGER NOT NULL';
                }
                else {
                    this.dbDefaultType = 'INTEGER';
                }
                break;
            case PropertyType.NUMBER:
                if (this.isIdentity) {
                    this.dbDefaultType = 'INTEGER NOT NULL';
                }
                else {
                    if (opts && opts.notNull) {
                        this.dbDefaultType = 'REAL NOT NULL';
                    }
                    else {
                        this.dbDefaultType = 'REAL';
                    }
                }
                break;
            default:
                // otherwise 'TEXT' will be used as default
                if (opts && opts.notNull) {
                    this.dbDefaultType = 'TEXT NOT NULL';
                }
                else {
                    this.dbDefaultType = 'TEXT';
                }
                break;
        }
    }
    static parseDbType(dbtype) {
        const typeDefMatches = /^\s*((\w+)(\s*\(\s*\d+\s*(,\s*\d+\s*)?\))?)(.*)$/.exec(dbtype);
        /* istanbul ignore if */
        if (!typeDefMatches) {
            throw new Error(`failed to parse '${dbtype}'`);
        }
        const typeAffinity = DbCatalogDAO.getTypeAffinity(typeDefMatches[2]);
        const rest = typeDefMatches[5];
        const notNull = /\bNOT\s+NULL\b/i.exec(rest) ? true : false;
        let defaultValue;
        const defaultNumberMatches = /\bDEFAULT\s+([+-]?\d+(\.\d*)?)/i.exec(rest);
        if (defaultNumberMatches) {
            defaultValue = defaultNumberMatches[1];
        }
        const defaultLiteralMatches = /\bDEFAULT\s+(('[^']*')+)/i.exec(rest);
        if (defaultLiteralMatches) {
            defaultValue = defaultLiteralMatches[1];
            defaultValue.replace(/''/g, "'");
        }
        const defaultExprMatches = /\bDEFAULT\s*\(([^)]*)\)/i.exec(rest);
        if (defaultExprMatches) {
            defaultValue = defaultExprMatches[1];
        }
        // debug(`dbtype='${dbtype}'`);
        // debug(`type='${typeName}'`);
        // debug(`notNull='${notNull}'`);
        // debug(`default='${defaultValue}'`);
        return { typeAffinity, notNull, defaultValue };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmllbGQubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9tZXRhZGF0YS9GaWVsZC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbkUsT0FBTyxFQUFvQixZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN4RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFbEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUV0Qzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxLQUFLO0lBTWhCOztPQUVHO0lBQ0gsSUFBSSxVQUFVO1FBQ1osT0FBTyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUdELElBQUksYUFBYTtRQUNmLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QixDQUFDO0lBQ0QsSUFBSSxhQUFhLENBQUMsTUFBYztRQUM5QixJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUQsQ0FBQztJQUNILENBQUM7SUFRRCxJQUFJLE1BQU07UUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDMUQsQ0FBQztJQUNELElBQUksTUFBTSxDQUFDLE1BQWM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLFdBQVcs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