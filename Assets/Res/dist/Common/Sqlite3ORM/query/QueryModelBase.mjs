/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { METADATA_MODEL_KEY } from '../metadata/index.mjs';
export const TABLEALIAS = 'T';
export class QueryModelBase {
    type;
    metaModel;
    table;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlNb2RlbEJhc2UubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9xdWVyeS9RdWVyeU1vZGVsQmFzZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pELHNFQUFzRTtBQUN0RSx1REFBdUQ7QUFDdkQsT0FBTyxFQUFFLGtCQUFrQixFQUFrQyxNQUFNLHVCQUF1QixDQUFDO0FBRTNGLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFFOUIsTUFBTSxPQUFPLGNBQWM7SUFDaEIsSUFBSSxDQUFnQjtJQUNwQixTQUFTLENBQVk7SUFDckIsS0FBSyxDQUFRO0lBRXRCLFlBQVksSUFBbUI7UUFDN0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsK0NBQStDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDN0MsQ0FBQztJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0kscUJBQXFCLENBQW9CLElBQVUsRUFBRSxVQUFtQjtRQUM3RSxVQUFVLEdBQUcsVUFBVSxJQUFJLEVBQUUsQ0FB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