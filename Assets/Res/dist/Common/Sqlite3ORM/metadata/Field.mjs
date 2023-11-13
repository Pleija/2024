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
     * The name of the column
     */
    name;
    /**
     * The quoted field name
     */
    get quotedName() {
        return backtickQuoteSimpleIdentifier(this.name);
    }
    _dbDefaultType;
    get dbDefaultType() {
        return this._dbDefaultType;
    }
    set dbDefaultType(dbType) {
        this._dbDefaultType = dbType;
        if (!this._dbtype) {
            this._dbTypeInfo = Field.parseDbType(this._dbDefaultType);
        }
    }
    /**
     * The type of the table column
     */
    _dbtype;
    _dbTypeInfo;
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
    /**
     * If this property should be serialized/deserialized to the database as Json data
     */
    _isJson;
    get isJson() {
        return this._isJson == undefined ? false : this._isJson;
    }
    set isJson(isJson) {
        this._isJson = isJson;
    }
    get isIsJsonDefined() {
        return this._isJson == undefined ? false : true;
    }
    _dateInMilliSeconds;
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
     * Flag if this field is part of the primary key
     */
    isIdentity;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmllbGQubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9tZXRhZGF0YS9GaWVsZC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbkUsT0FBTyxFQUFvQixZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN4RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFbEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUV0Qzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxLQUFLO0lBQ2hCOztPQUVHO0lBQ0ksSUFBSSxDQUFVO0lBRXJCOztPQUVHO0lBQ0gsSUFBSSxVQUFVO1FBQ1osT0FBTyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVPLGNBQWMsQ0FBVTtJQUNoQyxJQUFJLGFBQWE7UUFDZixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDN0IsQ0FBQztJQUNELElBQUksYUFBYSxDQUFDLE1BQWM7UUFDOUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDakIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUMzRDtJQUNILENBQUM7SUFFRDs7T0FFRztJQUNLLE9BQU8sQ0FBVTtJQUNqQixXQUFXLENBQW9CO0lBRXZDLElBQUksTUFBTTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUMxRCxDQUFDO0lBQ0QsSUFBSSxNQUFNLENBQUMsTUFBYztRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFDRCxJQUFJLGVBQWU7UUFDakIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNyQyxDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7T0FFRztJQUNLLE9BQU8sQ0FBVztJQUUxQixJQUFJLE1BQU07UUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDMUQsQ0FBQztJQUNELElBQUksTUFBTSxDQUFDLE1BQWU7UUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDeEIsQ0FBQztJQUNELElBQUksZUFBZTtRQUNqQixPQUFPLElBQUksQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNsRCxDQUFDO0lBRU8sbUJBQW1CLENBQVc7SUFDdEMsSUFBSSxrQkFBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLElBQUksU0FBUztZQUMxQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsa0JBQWtCO1lBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUM7SUFDL0IsQ0FBQztJQUNELElBQUksa0JBQWtCLENBQUMsR0FBWTtRQUNqQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsR0FBRyxDQUFDO0lBQ2pDLENBQUM7SUFDRCxJQUFJLDJCQUEyQjtRQUM3QixPQUFPLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzlELENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVUsQ0FBVTtJQUVwQjs7O09BR0c7SUFDSCxZQUNFLElBQVksRUFDWixVQUFvQixFQUNwQixJQUFnQixFQUNoQixZQUEyQjtRQUUzQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFFL0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxJQUFJLElBQUksRUFBRTtZQUNSLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDZixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDM0I7WUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxFQUFFO2dCQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDNUI7WUFDRCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxTQUFTLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7YUFDcEQ7U0FDRjtJQUNILENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxZQUEyQixFQUFFLElBQWdCO1FBQzVELFFBQVEsWUFBWSxFQUFFO1lBQ3BCLEtBQUssWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUMxQixLQUFLLFlBQVksQ0FBQyxJQUFJO2dCQUNwQixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUN4QixJQUFJLENBQUMsYUFBYSxHQUFHLGtCQUFrQixDQUFDO2lCQUN6QztxQkFBTTtvQkFDTCxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztpQkFDaEM7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssWUFBWSxDQUFDLE1BQU07Z0JBQ3RCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDbkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxrQkFBa0IsQ0FBQztpQkFDekM7cUJBQU07b0JBQ0wsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxlQUFlLENBQUM7cUJBQ3RDO3lCQUFNO3dCQUNMLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO3FCQUM3QjtpQkFDRjtnQkFDRCxNQUFNO1lBQ1I7Z0JBQ0UsMkNBQTJDO2dCQUMzQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUN4QixJQUFJLENBQUMsYUFBYSxHQUFHLGVBQWUsQ0FBQztpQkFDdEM7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7aUJBQzdCO2dCQUNELE1BQU07U0FDVDtJQUNILENBQUM7SUFFRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQWM7UUFDL0IsTUFBTSxjQUFjLEdBQUcsa0RBQWtELENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXZGLHdCQUF3QjtRQUN4QixJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDaEQ7UUFDRCxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvQixNQUFNLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRTVELElBQUksWUFBWSxDQUFDO1FBQ2pCLE1BQU0sb0JBQW9CLEdBQUcsaUNBQWlDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFFLElBQUksb0JBQW9CLEVBQUU7WUFDeEIsWUFBWSxHQUFHLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsTUFBTSxxQkFBcUIsR0FBRywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckUsSUFBSSxxQkFBcUIsRUFBRTtZQUN6QixZQUFZLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDbEM7UUFDRCxNQUFNLGtCQUFrQixHQUFHLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRSxJQUFJLGtCQUFrQixFQUFFO1lBQ3RCLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN0QztRQUVELCtCQUErQjtRQUMvQiwrQkFBK0I7UUFDL0IsaUNBQWlDO1FBQ2pDLHNDQUFzQztRQUN0QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0NBQ0YifQ==