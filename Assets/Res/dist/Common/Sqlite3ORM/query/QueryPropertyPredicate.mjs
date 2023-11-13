export class QueryPropertyPredicate {
    propertyKey;
    value;
    op;
    constructor(propertyKey, opName, value) {
        this.propertyKey = propertyKey;
        this.value = value;
        switch (opName) {
            case 'eq':
            case 'neq':
            case 'gt':
            case 'gte':
            case 'lt':
            case 'lte':
            case 'isIn':
            case 'isNotIn':
            case 'isBetween':
            case 'isNotBetween':
            case 'isLike':
            case 'isNotLike':
            case 'isNull':
            case 'isNotNull':
                this.op = opName;
                break;
            /* istanbul ignore next */
            default:
                throw new Error(`unknown comparison operation: '${opName}'`);
        }
    }
    async toSql(metaModel, params, tablePrefix) {
        const prop = metaModel.getProperty(this.propertyKey);
        let sql = `${tablePrefix}${prop.field.quotedName} `;
        const value = await this.value;
        sql += this.operatorSql(value);
        switch (this.op) {
            // no host variable:
            case 'isNull':
            case 'isNotNull':
                return sql;
            // one host variable:
            case 'eq':
            case 'neq':
            case 'gt':
            case 'gte':
            case 'lt':
            case 'lte':
            case 'isLike':
            case 'isNotLike':
                sql += ' ' + this.setHostParameter(prop, params, prop.valueToDB(value));
                return sql;
            // two host variables:
            case 'isBetween':
            case 'isNotBetween': {
                /* istanbul ignore if */
                if (!Array.isArray(value)) {
                    throw new Error(`expected array parameter for BETWEEN-operation on '${this.propertyKey.toString()}`);
                }
                /* istanbul ignore if */
                if (value.length !== 2) {
                    throw new Error(`expected 2-tuple for BETWEEN-operation on '${this.propertyKey.toString()}`);
                }
                const from = await value[0];
                const to = await value[1];
                sql += ' ' + this.setHostParameter(prop, params, prop.valueToDB(from));
                sql += ' AND ' + this.setHostParameter(prop, params, prop.valueToDB(to));
                return `(${sql})`;
            }
            // multiple host variables:
            case 'isIn':
            case 'isNotIn': {
                /* istanbul ignore if */
                if (!Array.isArray(value)) {
                    throw new Error(`expected array parameter for IN-operation on '${this.propertyKey.toString()}`);
                }
                if (!value.length) {
                    throw new Error(`expected a value for IN-operation on '${this.propertyKey.toString()}`);
                }
                const hostParams = [];
                for (const item of value) {
                    hostParams.push(this.setHostParameter(prop, params, prop.valueToDB(item)));
                }
                sql += ' (' + hostParams.join(', ') + ')';
                return sql;
            }
            /* istanbul ignore next */
            default:
                throw new Error(`unknown operation: '${this.op}`);
        }
    }
    operatorSql(value) {
        // add operator
        switch (this.op) {
            case 'isNull':
                return value ? 'ISNULL' : 'NOTNULL';
            case 'isNotNull':
                return value ? 'NOTNULL' : 'ISNULL';
            case 'eq':
                return '=';
            case 'neq':
                return '!=';
            case 'gt':
                return '>';
            case 'gte':
                return '>=';
            case 'lt':
                return '<';
            case 'lte':
                return '<=';
            case 'isLike':
                return 'LIKE';
            case 'isNotLike':
                return 'NOT LIKE';
            case 'isBetween':
                return 'BETWEEN';
            case 'isNotBetween':
                return 'NOT BETWEEN';
            case 'isIn':
                return 'IN';
            case 'isNotIn':
                return 'NOT IN';
            /* istanbul ignore next */
            default:
                throw new Error(`unknown operation: '${this.op}`);
        }
    }
    setHostParameter(prop, params, value) {
        const namePrefix = prop.getHostParameterName('w$');
        let nr = 1;
        let key = `${namePrefix}$`;
        while (Object.prototype.hasOwnProperty.call(params, key)) {
            nr++;
            key = `${namePrefix}$${nr}`;
        }
        params[key] = value;
        return key;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlQcm9wZXJ0eVByZWRpY2F0ZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL3F1ZXJ5L1F1ZXJ5UHJvcGVydHlQcmVkaWNhdGUubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE1BQU0sT0FBTyxzQkFBc0I7SUFFZDtJQUE2QztJQURoRSxFQUFFLENBQXlCO0lBQzNCLFlBQW1CLFdBQW9CLEVBQUUsTUFBYyxFQUFTLEtBQVU7UUFBdkQsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFBeUIsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUN4RSxRQUFRLE1BQU0sRUFBRTtZQUNkLEtBQUssSUFBSSxDQUFDO1lBQ1YsS0FBSyxLQUFLLENBQUM7WUFDWCxLQUFLLElBQUksQ0FBQztZQUNWLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxJQUFJLENBQUM7WUFDVixLQUFLLEtBQUssQ0FBQztZQUNYLEtBQUssTUFBTSxDQUFDO1lBQ1osS0FBSyxTQUFTLENBQUM7WUFDZixLQUFLLFdBQVcsQ0FBQztZQUNqQixLQUFLLGNBQWMsQ0FBQztZQUNwQixLQUFLLFFBQVEsQ0FBQztZQUNkLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxXQUFXO2dCQUNkLElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDO2dCQUNqQixNQUFNO1lBQ1IsMEJBQTBCO1lBQzFCO2dCQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDaEU7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFvQixFQUFFLE1BQWMsRUFBRSxXQUFtQjtRQUNuRSxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxJQUFJLEdBQUcs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