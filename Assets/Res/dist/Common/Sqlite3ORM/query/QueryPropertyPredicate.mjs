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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlQcm9wZXJ0eVByZWRpY2F0ZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL3F1ZXJ5L1F1ZXJ5UHJvcGVydHlQcmVkaWNhdGUubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE1BQU0sT0FBTyxzQkFBc0I7SUFFZDtJQUE2QztJQURoRSxFQUFFLENBQXlCO0lBQzNCLFlBQW1CLFdBQW9CLEVBQUUsTUFBYyxFQUFTLEtBQVU7UUFBdkQsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFBeUIsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUN4RSxRQUFRLE1BQU0sRUFBRSxDQUFDO1lBQ2YsS0FBSyxJQUFJLENBQUM7WUFDVixLQUFLLEtBQUssQ0FBQztZQUNYLEtBQUssSUFBSSxDQUFDO1lBQ1YsS0FBSyxLQUFLLENBQUM7WUFDWCxLQUFLLElBQUksQ0FBQztZQUNWLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssY0FBYyxDQUFDO1lBQ3BCLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxXQUFXLENBQUM7WUFDakIsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLFdBQVc7Z0JBQ2QsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUM7Z0JBQ2pCLE1BQU07WUFDUiwwQkFBMEI7WUFDMUI7Z0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNqRSxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBb0IsRUFBRSxNQUFjLEVBQUUsV0FBbUI7UUFDbkUsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckQs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