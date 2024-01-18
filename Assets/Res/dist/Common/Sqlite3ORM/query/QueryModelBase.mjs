/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { METADATA_MODEL_KEY } from '../metadata/index.mjs';
export const TABLEALIAS = 'T';
export class QueryModelBase {
    constructor(type) {
        this.type = type;
        this.metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, type.prototype);
        if (!this.metaModel) {
            throw new Error(`no table-definition defined on prototype of ${this.type.name}'`);
        }
        this.table = this.metaModel.table;
        if (!this.metaModel.qmCache) {
            this.metaModel.qmCache = this.buildCache();
        }
    }
    /**
     * Get 'SELECT ALL'-statement
     *
     * @returns The sql-statement
     */
    getSelectAllStatement(keys, tableAlias) {
        tableAlias = tableAlias || '';
        const tablePrefix = tableAlias.length ? `${tableAlias}.` : '';
        const props = this.getPropertiesFromKeys(keys);
        let stmt = 'SELECT\n';
        stmt +=
            `  ${tablePrefix}` + props.map((prop) => prop.field.quotedName).join(`,\n  ${tablePrefix}`);
        stmt += `\nFROM ${this.table.quotedName} ${tableAlias}\n`;
        return stmt;
    }
    /**
     * Get 'SELECT BY PRIMARY KEY'-statement
     *
     * @returns The sql-statement
     */
    getSelectByIdStatement(keys, tableAlias) {
        const tablePrefix = tableAlias && tableAlias.length ? `${tableAlias}.` : '';
        let stmt = this.getSelectAllStatement(keys, tableAlias);
        stmt += 'WHERE\n';
        stmt +=
            `  ${tablePrefix}` + this.metaModel.qmCache.primaryKeyPredicates.join(` AND ${tablePrefix}`);
        return stmt;
    }
    /**
     * Get 'SELECT ALL'-statement using provided column expression
     *
     * @returns The sql-statement
     */
    getSelectAllStatementForColumnExpression(colexpr, tableAlias) {
        tableAlias = tableAlias || '';
        return `SELECT\n${colexpr}\nFROM ${this.table.quotedName} ${tableAlias}\n`;
    }
    /**
     * Get 'UPDATE ALL' statement
     *
     * @returns The sql-statement
     */
    getUpdateAllStatement(keys) {
        let props = this.getPropertiesFromKeys(keys);
        props = props.filter((prop) => !prop.field.isIdentity);
        /* istanbul ignore if */
        if (!props.length) {
            throw new Error(`no columns to update'`);
        }
        let stmt = `UPDATE ${this.table.quotedName} SET\n  `;
        stmt += props
            .map((prop) => `${prop.field.quotedName} = ${prop.getHostParameterName()}`)
            .join(',\n  ');
        return stmt;
    }
    /**
     * Get 'UPDATE BY PRIMARY KEY' statement
     *
     * @returns The sql-statement
     */
    getUpdateByIdStatement(keys) {
        let stmt = this.getUpdateAllStatement(keys);
        stmt += '\nWHERE\n  ';
        stmt += this.metaModel.qmCache.primaryKeyPredicates.join(' AND ');
        return stmt;
    }
    /**
     * Get 'DELETE ALL'-statement
     *
     * @returns The sql-statement
     */
    getDeleteAllStatement() {
        return `DELETE FROM ${this.table.quotedName}`;
    }
    /**
     * Get 'DELETE BY PRIMARY KEY'-statement
     *
     * @returns The sql-statement
     */
    getDeleteByIdStatement() {
        let stmt = this.getDeleteAllStatement();
        stmt += '\nWHERE\n  ';
        stmt += this.metaModel.qmCache.primaryKeyPredicates.join(' AND ');
        return stmt;
    }
    /**
     * Get 'INSERT INTO'-statement
     *
     * @returns The sql-statement
     */
    getInsertIntoStatement(keys) {
        const props = this.getPropertiesFromKeys(keys);
        if (!props.length) {
            return `INSERT INTO ${this.table.quotedName} DEFAULT VALUES`;
        }
        let stmt = `INSERT INTO ${this.table.quotedName} (\n  `;
        stmt += props.map((prop) => prop.field.quotedName).join(', ');
        stmt += '\n) VALUES (\n  ';
        stmt += props.map((prop) => prop.getHostParameterName()).join(', ');
        stmt += '\n)';
        return stmt;
    }
    /**
     * Get 'REPLACE INTO'-statement
     *
     * @returns The sql-statement
     */
    getInsertOrReplaceStatement(keys) {
        const props = this.getPropertiesFromKeys(keys);
        if (!props.length) {
            return `INSERT OR REPLACE INTO ${this.table.quotedName} DEFAULT VALUES`;
        }
        let stmt = `INSERT OR REPLACE INTO ${this.table.quotedName} (\n  `;
        stmt += props.map((prop) => prop.field.quotedName).join(', ');
        stmt += '\n) VALUES (\n  ';
        stmt += props.map((prop) => prop.getHostParameterName()).join(', ');
        stmt += '\n)';
        return stmt;
    }
    /**
     * Get a select-condition for a foreign key constraint
     *
     * @param constraintName - The constraint name
     * @returns The partial where-clause
     */
    getForeignKeyPredicates(constraintName) {
        return this.metaModel.qmCache.foreignKeyPredicates.get(constraintName);
    }
    /**
     * Get the foreign key (child) properties for a foreign key constraint
     *
     * @param constraintName - The constraint name
     * @returns The properties holding the foreign key
     */
    getForeignKeyProps(constraintName) {
        return this.metaModel.qmCache.foreignKeyProps.get(constraintName);
    }
    /**
     * Get the reference (parent) columns for a foreign key constraint
     *
     * @param constraintName - The constraint name
     * @returns The referenced column names
     */
    getForeignKeyRefCols(constraintName) {
        return this.metaModel.qmCache.foreignKeyRefCols.get(constraintName);
    }
    getPropertiesFromKeys(keys, addIdentity) {
        if (!keys) {
            return Array.from(this.metaModel.properties.values());
        }
        const res = new Map();
        keys.forEach((key) => {
            const prop = this.metaModel.properties.get(key);
            if (!prop) {
                return;
            }
            res.set(key, prop);
        });
        /* istanbul ignore if */
        if (addIdentity) {
            // for later use
            this.metaModel.qmCache.primaryKeyProps
                .filter((prop) => !res.has(prop.key))
                .forEach((prop) => {
                res.set(prop.key, prop);
            });
        }
        return Array.from(res.values());
    }
    getPropertiesFromColumnNames(cols, notFoundCols) {
        const resProps = [];
        /* istanbul ignore if */
        if (!notFoundCols) {
            notFoundCols = [];
        }
        cols.forEach((colName) => {
            const refProp = this.metaModel.mapColNameToProp.get(colName);
            /* istanbul ignore else */
            if (refProp) {
                resProps.push(refProp);
            }
            else {
                notFoundCols.push(colName);
            }
        });
        /* istanbul ignore if */
        if (notFoundCols.length) {
            return undefined;
        }
        return resProps;
    }
    setHostParam(hostParams, prop, model) {
        hostParams[prop.getHostParameterName()] = prop.getDBValueFromModel(model);
    }
    setHostParamValue(hostParams, prop, value) {
        hostParams[prop.getHostParameterName()] = value;
    }
    updateModelFromRow(model, row) {
        this.metaModel.properties.forEach((prop) => {
            prop.setDBValueIntoModel(model, row[prop.field.name]);
        });
        return model;
    }
    getPartialFromRow(row) {
        const res = {};
        this.metaModel.properties.forEach((prop) => {
            if (row[prop.field.name] !== undefined) {
                prop.setDBValueIntoModel(res, row[prop.field.name]);
            }
        });
        return res;
    }
    bindForeignParams(foreignQueryModel, constraintName, foreignObject, more = {}) {
        const hostParams = Object.assign({}, more);
        const fkProps = this.getForeignKeyProps(constraintName);
        const refCols = this.getForeignKeyRefCols(constraintName);
        /* istanbul ignore if */
        if (!fkProps || !refCols || fkProps.length !== refCols.length) {
            throw new Error(`bind information for '${constraintName}' in table '${this.table.name}' is incomplete`);
        }
        const refNotFoundCols = [];
        const refProps = foreignQueryModel.getPropertiesFromColumnNames(refCols, refNotFoundCols);
        /* istanbul ignore if */
        if (!refProps || refNotFoundCols.length) {
            const s = '"' + refNotFoundCols.join('", "') + '"';
            throw new Error(`in '${foreignQueryModel.metaModel.name}': no property mapped to these fields: ${s}`);
        }
        for (let i = 0; i < fkProps.length; ++i) {
            const fkProp = fkProps[i];
            const refProp = refProps[i];
            this.setHostParamValue(hostParams, fkProp, refProp.getDBValueFromModel(foreignObject));
        }
        return hostParams;
    }
    bindAllInputParams(model, keys, addIdentity) {
        const hostParams = {};
        const props = this.getPropertiesFromKeys(keys, addIdentity);
        props.forEach((prop) => {
            this.setHostParam(hostParams, prop, model);
        });
        return hostParams;
    }
    /* istanbul ignore next */
    // obsolete
    bindNonPrimaryKeyInputParams(model, keys) {
        const hostParams = {};
        const props = this.getPropertiesFromKeys(keys);
        props
            .filter((prop) => !prop.field.isIdentity)
            .forEach((prop) => {
            this.setHostParam(hostParams, prop, model);
        });
        return hostParams;
    }
    bindPrimaryKeyInputParams(model) {
        const hostParams = {};
        this.metaModel.qmCache.primaryKeyProps.forEach((prop) => {
            this.setHostParam(hostParams, prop, model);
        });
        return hostParams;
    }
    buildCache() {
        /* istanbul ignore if */
        if (!this.metaModel.properties.size) {
            throw new Error(`class '${this.metaModel.name}': does not have any mapped properties`);
        }
        // primary key predicates
        const props = Array.from(this.metaModel.properties.values());
        const primaryKeyProps = props.filter((prop) => prop.field.isIdentity);
        const primaryKeyPredicates = primaryKeyProps.map((prop) => `${prop.field.quotedName}=${prop.getHostParameterName()}`);
        // --------------------------------------------------------------
        // generate SELECT-fk condition
        const foreignKeyPredicates = new Map();
        const foreignKeyProps = new Map();
        const foreignKeyRefCols = new Map();
        this.table.mapNameToFKDef.forEach((fkDef, constraintName) => {
            const fkProps = [];
            fkDef.fields.forEach((fkField) => {
                const prop = this.metaModel.mapColNameToProp.get(fkField.name);
                /* istanbul ignore else */
                if (prop) {
                    fkProps.push(prop);
                }
            });
            /* istanbul ignore else */
            if (fkProps.length === fkDef.fields.length) {
                const selectCondition = fkProps.map((prop) => `${prop.field.quotedName}=${prop.getHostParameterName()}`);
                foreignKeyPredicates.set(constraintName, selectCondition);
                foreignKeyProps.set(constraintName, fkProps);
                foreignKeyRefCols.set(constraintName, fkDef.fields.map((field) => field.foreignColumnName));
            }
        });
        return {
            primaryKeyProps,
            primaryKeyPredicates,
            foreignKeyPredicates,
            foreignKeyProps,
            foreignKeyRefCols,
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlNb2RlbEJhc2UubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9xdWVyeS9RdWVyeU1vZGVsQmFzZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pELHNFQUFzRTtBQUN0RSx1REFBdUQ7QUFDdkQsT0FBTyxFQUFFLGtCQUFrQixFQUFrQyxNQUFNLHVCQUF1QixDQUFDO0FBRTNGLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFFOUIsTUFBTSxPQUFPLGNBQWM7SUFLekIsWUFBWSxJQUFtQjtRQUM3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUM3QyxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxxQkFBcUIsQ0FBb0IsSUFBVSxFQUFFLFVBQW1CO1FBQzdFLFVBQVUsR0FBRyxVQUFVLElBQUksRUFBRSxDQUFDO1FBQzlCLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQ3RCLElBQUk7WUFDRixLQUFLLFdBQVcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUM5RixJQUFJLElBQUksVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxVQUFVLElBQUksQ0FBQztRQUMxRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksc0JBQXNCLENBQW9CLElBQVUsRUFBRSxVQUFtQjtRQUM5RSxNQUFNLFdBQVcsR0FBRyxVQUFVLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEQsSUFBSSxJQUFJLFNBQVMsQ0FBQztRQUNsQixJQUFJO1lBQ0YsS0FBSyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQy9GLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSx3Q0FBd0MsQ0FBQyxPQUFlLEVBQUUsVUFBbUI7UUFDbEYsVUFBVSxHQUFHLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDOUIsT0FBTyxXQUFXLE9BQU8sVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxVQUFVLElBQUksQ0FBQztJQUM3RSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLHFCQUFxQixDQUFvQixJQUFVO1FBQ3hELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXZELHdCQUF3QjtRQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRUQsSUFBSSxJQUFJLEdBQUcsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsVUFBVSxDQUFDO1FBQ3JELElBQUksSUFBSSxLQUFLO2FBQ1YsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUM7YUFDMUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxzQkFBc0IsQ0FBb0IsSUFBVTtRQUN6RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsSUFBSSxJQUFJLGFBQWEsQ0FBQztRQUN0QixJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxxQkFBcUI7UUFDMUIsT0FBTyxlQUFlLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxzQkFBc0I7UUFDM0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDeEMsSUFBSSxJQUFJLGFBQWEsQ0FBQztRQUN0QixJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxzQkFBc0IsQ0FBb0IsSUFBVTtRQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsQixPQUFPLGVBQWUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLGlCQUFpQixDQUFDO1FBQy9ELENBQUM7UUFFRCxJQUFJLElBQUksR0FBRyxlQUFlLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxRQUFRLENBQUM7UUFDeEQsSUFBSSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlELElBQUksSUFBSSxrQkFBa0IsQ0FBQztRQUMzQixJQUFJLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEUsSUFBSSxJQUFJLEtBQUssQ0FBQztRQUNkLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSwyQkFBMkIsQ0FBb0IsSUFBVTtRQUM5RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsQixPQUFPLDBCQUEwQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsaUJBQWlCLENBQUM7UUFDMUUsQ0FBQztRQUNELElBQUksSUFBSSxHQUFHLDBCQUEwQixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsUUFBUSxDQUFDO1FBQ25FLElBQUksSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5RCxJQUFJLElBQUksa0JBQWtCLENBQUM7UUFDM0IsSUFBSSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BFLElBQUksSUFBSSxLQUFLLENBQUM7UUFDZCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLHVCQUF1QixDQUFDLGNBQXNCO1FBQ25ELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLGtCQUFrQixDQUFDLGNBQXNCO1FBQzlDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxvQkFBb0IsQ0FBQyxjQUFzQjtRQUNoRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRU0scUJBQXFCLENBQUMsSUFBa0IsRUFBRSxXQUFxQjtRQUNwRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDVixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsTUFBTSxHQUFHLEdBQWdELElBQUksR0FBRyxFQUFFLENBQUM7UUFDbkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1YsT0FBTztZQUNULENBQUM7WUFDRCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztRQUNILHdCQUF3QjtRQUN4QixJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hCLGdCQUFnQjtZQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlO2lCQUNuQyxNQUFNLENBQUMsQ0FBQyxJQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNsRCxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDaEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU0sNEJBQTRCLENBQ2pDLElBQWMsRUFDZCxZQUF1QjtRQUV2QixNQUFNLFFBQVEsR0FBbUIsRUFBRSxDQUFDO1FBQ3BDLHdCQUF3QjtRQUN4QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbEIsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3ZCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdELDBCQUEwQjtZQUMxQixJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNaLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekIsQ0FBQztpQkFBTSxDQUFDO2dCQUNMLFlBQXlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILHdCQUF3QjtRQUN4QixJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN4QixPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVNLFlBQVksQ0FBQyxVQUFlLEVBQUUsSUFBa0IsRUFBRSxLQUFpQjtRQUN4RSxVQUFVLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVNLGlCQUFpQixDQUFDLFVBQWUsRUFBRSxJQUFrQixFQUFFLEtBQVU7UUFDdEUsVUFBVSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ2xELENBQUM7SUFFTSxrQkFBa0IsQ0FBQyxLQUFRLEVBQUUsR0FBUTtRQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN6QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxHQUFRO1FBQy9CLE1BQU0sR0FBRyxHQUFlLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN6QyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEQsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBRU0saUJBQWlCLENBQ3RCLGlCQUFvQyxFQUNwQyxjQUFzQixFQUN0QixhQUFnQixFQUNoQixPQUFlLEVBQUU7UUFFakIsTUFBTSxVQUFVLEdBQVcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUUxRCx3QkFBd0I7UUFDeEIsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5RCxNQUFNLElBQUksS0FBSyxDQUNiLHlCQUF5QixjQUFjLGVBQWUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUN2RixDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sZUFBZSxHQUFhLEVBQUUsQ0FBQztRQUNyQyxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDMUYsd0JBQXdCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLElBQUksZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNuRCxNQUFNLElBQUksS0FBSyxDQUNiLE9BQU8saUJBQWlCLENBQUMsU0FBUyxDQUFDLElBQUksMENBQTBDLENBQUMsRUFBRSxDQUNyRixDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDeEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVNLGtCQUFrQixDQUFDLEtBQWlCLEVBQUUsSUFBa0IsRUFBRSxXQUFxQjtRQUNwRixNQUFNLFVBQVUsR0FBVyxFQUFFLENBQUM7UUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM1RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDckIsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVELDBCQUEwQjtJQUMxQixXQUFXO0lBQ0osNEJBQTRCLENBQUMsS0FBaUIsRUFBRSxJQUFrQjtRQUN2RSxNQUFNLFVBQVUsR0FBVyxFQUFFLENBQUM7UUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLEtBQUs7YUFDRixNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7YUFDeEMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVNLHlCQUF5QixDQUFDLEtBQWlCO1FBQ2hELE1BQU0sVUFBVSxHQUFXLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBa0IsRUFBRSxFQUFFO1lBQ3BFLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFTyxVQUFVO1FBQ2hCLHdCQUF3QjtRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFFRCx5QkFBeUI7UUFDekIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzdELE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEUsTUFBTSxvQkFBb0IsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUM5QyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUNwRSxDQUFDO1FBRUYsaUVBQWlFO1FBQ2pFLCtCQUErQjtRQUMvQixNQUFNLG9CQUFvQixHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1FBQ3pELE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO1FBQzFELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7UUFFdEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUFFO1lBQzFELE1BQU0sT0FBTyxHQUFtQixFQUFFLENBQUM7WUFDbkMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDL0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMvRCwwQkFBMEI7Z0JBQzFCLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckIsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsMEJBQTBCO1lBQzFCLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUMzQyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUNqQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUNwRSxDQUFDO2dCQUNGLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBQzFELGVBQWUsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUM3QyxpQkFBaUIsQ0FBQyxHQUFHLENBQ25CLGNBQWMsRUFDZCxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQ3JELENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPO1lBQ0wsZUFBZTtZQUNmLG9CQUFvQjtZQUNwQixvQkFBb0I7WUFDcEIsZUFBZTtZQUNmLGlCQUFpQjtTQUNsQixDQUFDO0lBQ0osQ0FBQztDQUNGIn0=