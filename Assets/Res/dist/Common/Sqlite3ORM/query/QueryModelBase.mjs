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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlNb2RlbEJhc2UubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9xdWVyeS9RdWVyeU1vZGVsQmFzZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pELHNFQUFzRTtBQUN0RSx1REFBdUQ7QUFDdkQsT0FBTyxFQUFFLGtCQUFrQixFQUFrQyxNQUFNLHVCQUF1QixDQUFDO0FBRTNGLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFFOUIsTUFBTSxPQUFPLGNBQWM7SUFDaEIsSUFBSSxDQUFnQjtJQUNwQixTQUFTLENBQVk7SUFDckIsS0FBSyxDQUFRO0lBRXRCLFlBQVksSUFBbUI7UUFDN0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7U0FDbkY7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRTtZQUMzQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDNUM7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLHFCQUFxQixDQUFvQixJQUFVLEVBQUUsVUFBbUI7UUFDN0UsVUFBVSxHQUFHLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDOUIsTUFBTSxXQUFXLEdB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