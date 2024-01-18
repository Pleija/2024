export class QueryPropertyPredicate {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlQcm9wZXJ0eVByZWRpY2F0ZS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL3F1ZXJ5L1F1ZXJ5UHJvcGVydHlQcmVkaWNhdGUubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE1BQU0sT0FBTyxzQkFBc0I7SUFFakMsWUFBbUIsV0FBb0IsRUFBRSxNQUFjLEVBQVMsS0FBVTtRQUF2RCxnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUF5QixVQUFLLEdBQUwsS0FBSyxDQUFLO1FBQ3hFLFFBQVEsTUFBTSxFQUFFLENBQUM7WUFDZixLQUFLLElBQUksQ0FBQztZQUNWLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxJQUFJLENBQUM7WUFDVixLQUFLLEtBQUssQ0FBQztZQUNYLEtBQUssSUFBSSxDQUFDO1lBQ1YsS0FBSyxLQUFLLENBQUM7WUFDWCxLQUFLLE1BQU0sQ0FBQztZQUNaLEtBQUssU0FBUyxDQUFDO1lBQ2YsS0FBSyxXQUFXLENBQUM7WUFDakIsS0FBSyxjQUFjLENBQUM7WUFDcEIsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLFdBQVcsQ0FBQztZQUNqQixLQUFLLFFBQVEsQ0FBQztZQUNkLEtBQUssV0FBVztnQkFDZCxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQztnQkFDakIsTUFBTTtZQUNSLDBCQUEwQjtZQUMxQjtnQkFDRSxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFvQixFQUFFLE1BQWMsRUFBRSxXQUFtQjtRQUNuRSxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxJQUFJLEdBQUcsR0FBRyxHQUFHLFdBQVcsR0FB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