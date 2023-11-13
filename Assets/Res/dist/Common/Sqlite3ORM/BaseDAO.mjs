import { isFilter, QueryModel, TABLEALIAS } from './query/index.mjs';
/**
 *
 * @export
 * @enum
 */
export var BaseDAOInsertMode;
(function (BaseDAOInsertMode) {
    /** use the provided value if defined, otherwise let sqlite generate the value automatically */
    BaseDAOInsertMode[BaseDAOInsertMode["StrictSqlite"] = 1] = "StrictSqlite";
    /** prevents the insertion of predefined primary key values; always let sqlite generate a value automatically */
    BaseDAOInsertMode[BaseDAOInsertMode["ForceAutoGeneration"] = 2] = "ForceAutoGeneration";
})(BaseDAOInsertMode || (BaseDAOInsertMode = {}));
/**
 *
 *
 * @export
 * @class BaseDAO
 * @template T - The class mapped to the base table
 */
export class BaseDAO {
    static options;
    type;
    metaModel;
    table;
    sqldb;
    queryModel;
    /**
     * Creates an instance of BaseDAO.
     *
     * @param type - The class mapped to the base table
     * @param sqldb - The database connection
     */
    constructor(type, sqldb) {
        this.type = type;
        this.queryModel = new QueryModel(this.type);
        this.metaModel = this.queryModel.metaModel;
        this.table = this.queryModel.table;
        this.sqldb = sqldb;
    }
    /**
     * insert
     *
     * @param model - A model class instance
     * @returns A promise of the inserted model class instance
     */
    async insert(model, mode) {
        return this.insertInternal(model, undefined, mode);
    }
    /**
     * insert partially - insert only columns mapped to the property keys from the partial input model
     *
     * for this to work:
     * all columns mapped to included properties must be nullable or their properties must provide a value
     * all columns mapped to excluded properties must be nullable or must have a database default value
     *
     * @param input - A model class instance
     * @returns A promise of the inserted model class instance
     */
    async insertPartial(input, mode) {
        const keys = Object.keys(input);
        return this.insertInternal(input, keys, mode);
    }
    /**
     * replace ( insert or replace )
     *
     * @param model - A model class instance
     * @returns A promise of the inserted or updated model class instance
     */
    async replace(model) {
        return this.insertOrReplaceInternal(model);
    }
    /**
     * replace ( insert or replace ) partially
     *
     * for this to work:
     * all columns mapped to included properties must be nullable or their properties must provide a value
     * on insert: all columns mapped to excluded properties must be nullable or must have a database default value
     * on update: all columns mapped to excluded properties are not affected by this update
     *
     * @param input - A model class instance
     * @returns A promise of the inserted or updated model class instance
     */
    async replacePartial(input) {
        const keys = Object.keys(input);
        return this.insertOrReplaceInternal(input, keys);
    }
    /**
     * update
     *
     * @param model - A model class instance
     * @returns A promise of the updated model class instance
     */
    async update(model) {
        return this.updateInternal(model);
    }
    /**
     * update partially - update only columns mapped to the property keys from the partial input model
     *
     * for this to work:
     * all columns mapped to included properties must be nullable or their properties must provide a value
     * all other columns are not affected by this update
     *
     * @param input - A model class instance
     * @returns A promise of the updated model class instance
     */
    async updatePartial(input) {
        const keys = Object.keys(input);
        return this.updateInternal(input, keys);
    }
    /**
     * update all - please provide a proper sql-condition otherwise all records will be updated!
     * this updates only columns mapped to the property keys from the partial input model
     *
     * for this to work:
     * all columns mapped to included properties must be nullable or their properties must provide a value
     * all other columns are not affected by this update
     *
     * @param input - A model class instance
     * @param [where] - An optional Where-object or sql-text which will be added to the update-statement
     *                    e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of the updated model class instance
     */
    async updatePartialAll(input, where, params) {
        try {
            const keys = Object.keys(input);
            let sql = this.queryModel.getUpdateAllStatement(keys);
            params = Object.assign({}, this.queryModel.bindAllInputParams(input, keys), params);
            const whereClause = await this.queryModel.getWhereClause(this.toFilter(where), params);
            sql += `  ${whereClause}`;
            const res = await this.sqldb.run(sql, params);
            if (!res.changes && !BaseDAO.options?.ignoreNoChanges) {
                // TODO: Breaking Change: change to: BaseDAO.options?.ignoreNoChanges !== false
                return Promise.reject(new Error(`update '${this.table.name}' failed: nothing changed`));
            }
            return res.changes;
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(new Error(`update '${this.table.name}' failed: ${e.message}`));
        }
    }
    /**
     * delete using primary key
     *
     * @param model - A model class instance
     * @returns A promise
     */
    delete(model) {
        return this.deleteById(model);
    }
    /**
     * delete using primary key
     *
     * @param input - A partial model class instance
     * @returns A promise
     */
    async deleteById(input) {
        try {
            const res = await this.sqldb.run(this.queryModel.getDeleteByIdStatement(), this.queryModel.bindPrimaryKeyInputParams(input));
            if (!res.changes) {
                return Promise.reject(new Error(`delete from '${this.table.name}' failed: nothing changed`));
            }
        }
        catch (e) {
            // NOTE: should not happen
            /* istanbul ignore next */
            return Promise.reject(new Error(`delete from '${this.table.name}' failed: ${e.message}`));
        }
    }
    /**
     * delete all - please provide a proper sql-condition otherwise all records will be deleted!
     *
     * @param [where] - An optional Where-object or sql-text which will be added to the delete-statement
     *                    e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise
     */
    async deleteAll(where, params) {
        try {
            let sql = this.queryModel.getDeleteAllStatement();
            params = Object.assign({}, params);
            const whereClause = await this.queryModel.getWhereClause(this.toFilter(where), params);
            sql += `  ${whereClause}`;
            const res = await this.sqldb.run(sql, params);
            if (!res.changes && !BaseDAO.options?.ignoreNoChanges) {
                // TODO: Breaking Change: change to: BaseDAO.options?.ignoreNoChanges !== false
                return Promise.reject(new Error(`delete from '${this.table.name}' failed: nothing changed`));
            }
            return Promise.resolve(res.changes);
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(new Error(`delete from '${this.table.name}' failed: ${e.message}`));
        }
    }
    /**
     * Select a given model
     *
     * @param model - The input/output model
     * @returns A promise of the model instance
     */
    select(model) {
        return this.queryModel.selectModel(this.sqldb, model);
    }
    /**
     * select using primary key
     *
     * @param input - A partial model class instance
     * @returns A promise of the model instance
     */
    selectById(input) {
        return this.queryModel.selectModelById(this.sqldb, input);
    }
    /**
     * select parent by using a foreign key constraint and a given child instance
     *
     * @template C - The class mapped to the child table
     * @param constraintName - The foreign key constraint (defined in the child table)
     * @param childType - The class mapped to the childtable
     * @param childObj - An instance of the class mapped to the child table
     * @returns A promise of model instance
     */
    async selectByChild(constraintName, childType, childObj) {
        // TODO: refactor to use QueryModel and a Where object
        // create child DAO
        const childDAO = new BaseDAO(childType, this.sqldb);
        let output;
        try {
            // get child properties
            const fkProps = childDAO.queryModel.getForeignKeyProps(constraintName);
            const cols = childDAO.queryModel.getForeignKeyRefCols(constraintName);
            /* istanbul ignore if */
            if (!fkProps || !cols) {
                throw new Error(`in '${childDAO.metaModel.name}': constraint '${constraintName}' is not defined`);
            }
            const refNotFoundCols = [];
            // get parent (our) properties
            const props = this.queryModel.getPropertiesFromColumnNames(cols, refNotFoundCols);
            /* istanbul ignore if */
            if (!props || refNotFoundCols.length) {
                const s = '"' + refNotFoundCols.join('", "') + '"';
                throw new Error(`in '${this.metaModel.name}': no property mapped to these fields: ${s}`);
            }
            // bind parameters
            const hostParams = {};
            for (let i = 0; i < fkProps.length; ++i) {
                this.queryModel.setHostParamValue(hostParams, props[i], fkProps[i].getDBValueFromModel(childObj));
            }
            // generate statement
            let stmt = this.queryModel.getSelectAllStatement(undefined, TABLEALIAS);
            stmt += '\nWHERE\n  ';
            stmt += props
                .map((prop) => `${TABLEALIAS}.${prop.field.quotedName}=${prop.getHostParameterName()}`)
                .join(' AND ');
            const row = await this.sqldb.get(stmt, hostParams);
            output = this.queryModel.updateModelFromRow(new this.type(), row);
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(new Error(`select '${this.table.name}' failed: ${e.message}`));
        }
        return output;
    }
    /**
     * select parent by using a foreign key constraint and a given child instance
     *
     * @template P - The class mapped to the parent table
     * @param constraintName - The foreign key constraint (defined in the child table)
     * @param parentType - The class mapped to the parent table
     * @param childObj - An instance of the class mapped to the child table
     * @returns A promise of model instance
     */
    selectParentOf(constraintName, parentType, childObj) {
        const parentDAO = new BaseDAO(parentType, this.sqldb);
        return parentDAO.selectByChild(constraintName, this.type, childObj);
    }
    /**
     * Select one model using an optional filter
     *
     * @param [whereOrFilter] - An optional Where/Filter-object or
     *                          sql-text which will be added to the select-statement
     *                             e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of the selected model instance; rejects if result is not exactly one row
     */
    selectOne(whereOrFilter, params) {
        return this.queryModel.selectOne(this.sqldb, this.toFilter(whereOrFilter, TABLEALIAS), params);
    }
    /**
     * Select all models using an optional filter
     *
     * @param [whereOrFilter] - An optional Where/Filter-object or
     *                          sql-text which will be added to the select-statement
     *                             e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of array of model instances
     */
    selectAll(whereOrFilter, params) {
        return this.queryModel.selectAll(this.sqldb, this.toFilter(whereOrFilter, TABLEALIAS), params);
    }
    /**
     * Count all models using an optional filter
     *
     * @param [whereOrFilter] - An optional Where/Filter-object or
     *                          sql-text which will be added to the select-statement
     *                             e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of the count value
     */
    countAll(whereOrFilter, params) {
        return this.queryModel.countAll(this.sqldb, this.toFilter(whereOrFilter, TABLEALIAS), params);
    }
    /**
     * check if model exist using an optional filter
     *
     * @param [whereOrFilter] - An optional Where/Filter-object or
     *                          sql-text which will be added to the select-statement
     *                             e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of the count value
     */
    exists(whereOrFilter, params) {
        return this.queryModel.exists(this.sqldb, this.toFilter(whereOrFilter, TABLEALIAS), params);
    }
    /**
     * Select all partial models using a filter
     *
     * @param filter - A Filter-object
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of array of model instances
     */
    selectPartialAll(filter, params) {
        return this.queryModel.selectPartialAll(this.sqldb, filter, params);
    }
    /**
     * select all childs using a foreign key constraint and a given parent instance
     *
     * @template P - The class mapped to the parent table
     * @param constraintName - The foreign key constraint
     * @param parentType - The class mapped to the parent table
     * @param parentObj - An instance of the class mapped to the parent table
     * @param [whereOrFilter] - An optional Where/Filter-object or sql-text which will be added to the select-statement
     *                    e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of array of model instances
     */
    async selectAllOf(constraintName, parentType, parentObj, whereOrFilter, params) {
        try {
            // TODO: refactor to use QueryModel and a Where object
            const fkPredicates = this.queryModel.getForeignKeyPredicates(constraintName);
            if (!fkPredicates) {
                throw new Error(`constraint '${constraintName}' is not defined`);
            }
            let stmt = this.queryModel.getSelectAllStatement(undefined, TABLEALIAS);
            stmt += '\nWHERE\n';
            stmt += `  ${TABLEALIAS}.` + fkPredicates.join(` AND ${TABLEALIAS}.`);
            if (whereOrFilter) {
                stmt += ' ';
                stmt += whereOrFilter;
            }
            const parentDAO = new BaseDAO(parentType, this.sqldb);
            const childParams = this.queryModel.bindForeignParams(parentDAO.queryModel, constraintName, parentObj, params);
            const rows = await this.sqldb.all(stmt, childParams);
            const results = [];
            rows.forEach((row) => {
                results.push(this.queryModel.updateModelFromRow(new this.type(), row));
            });
            return results;
        }
        catch (e) {
            return Promise.reject(new Error(`select '${this.table.name}' failed: ${e.message}`));
        }
    }
    /**
     * select all childs using a foreign key constraint and a given parent instance
     *
     * @template C - The class mapped to the child table
     * @param constraintName - The foreign key constraint (defined in the child table)
     * @param childType - The class mapped to the childtable
     * @param parentObj - An instance of the class mapped to the parent table
     * @param [where] - An optional Where/Filter-object or sql-text which will be added to the select-statement
     *                    e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise of array of model instances
     */
    selectAllChildsOf(constraintName, childType, parentObj, where, params) {
        const childDAO = new BaseDAO(childType, this.sqldb);
        return childDAO.selectAllOf(constraintName, this.type, parentObj, where, params);
    }
    /**
     * perform:
     * select T.<col1>,.. FROM <table> T
     *
     * @param callback - The callback called for each row
     * @param [whereOrFilter] - An optional Where/Filter-object or sql-text which will be added to the select-statement
     *                     e.g 'WHERE <your condition>'
     * @param [params] - An optional object with additional host parameter
     * @returns A promise
     */
    async selectEach(callback, whereOrFilter, params) {
        return this.queryModel.selectEach(this.sqldb, callback, this.toFilter(whereOrFilter, TABLEALIAS), params);
    }
    /**
     * create a table in the database
     *
     * @returns {Promise<void>}
     */
    createTable(force) {
        return this.sqldb.exec(this.table.getCreateTableStatement(force));
    }
    /**
     * drop a table from the database
     *
     * @returns {Promise<void>}
     */
    dropTable() {
        return this.sqldb.exec(this.table.getDropTableStatement());
    }
    /**
     * add a column/field to a database table
     *
     * @param colName - The column/field to add
     * @returns A promise
     */
    alterTableAddColumn(colName) {
        return this.sqldb.exec(this.table.getAlterTableAddColumnStatement(colName));
    }
    /**
     * create index in the database
     *
     * @param idxName - The name of the index
     * @param [unique] - create unique index
     * @returns A promise
     */
    createIndex(idxName, unique) {
        return this.sqldb.exec(this.table.getCreateIndexStatement(idxName, unique));
    }
    /**
     * drop an index from the database
     *
     * @param idxName - The name of the index
     * @returns A promise
     */
    dropIndex(idxName) {
        return this.sqldb.exec(this.table.getDropIndexStatement(idxName));
    }
    toFilter(whereOrFilter, tableAlias) {
        if (whereOrFilter && isFilter(whereOrFilter)) {
            return whereOrFilter;
        }
        return { where: whereOrFilter, tableAlias };
    }
    async insertInternal(input, keys, mode) {
        try {
            const insertMode = mode || BaseDAO.options?.insertMode;
            const stmt = this.queryModel.getInsertIntoStatement(keys);
            const params = this.queryModel.bindAllInputParams(input, keys);
            const idProperty = this.table.rowIdField
                ? this.metaModel.mapColNameToProp.get(this.table.rowIdField.name)
                : undefined;
            if (idProperty && idProperty.getDBValueFromModel(input) != undefined) {
                if ((insertMode === undefined && this.table.autoIncrementField) ||
                    insertMode === BaseDAOInsertMode.ForceAutoGeneration) {
                    params[idProperty.getHostParameterName()] = null;
                }
            }
            const res = await this.sqldb.run(stmt, params);
            if (idProperty) {
                /* istanbul ignore if */
                if (res.lastID == undefined) {
                    // NOTE: should not happen
                    const operation = this.table.autoIncrementField ? 'AUTOINCREMENT' : 'ROWID';
                    return Promise.reject(new Error(`insert into '${this.table.name}' using ${operation} failed: 'lastID' is null or undefined`));
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                res[this.table.rowIdField.name] = res.lastID;
                /* istanbul ignore else */
                idProperty.setDBValueIntoModel(input, res.lastID);
            }
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(new Error(`insert into '${this.table.name}' failed: ${e.message}`));
        }
        return input;
    }
    async insertOrReplaceInternal(input, keys) {
        try {
            const res = await this.sqldb.run(this.queryModel.getInsertOrReplaceStatement(keys), this.queryModel.bindAllInputParams(input, keys));
            if (this.table.autoIncrementField) {
                /* istanbul ignore if */
                if (res.lastID == undefined) {
                    // NOTE: should not happen
                    return Promise.reject(new Error("replace into '${this.table.name}' failed: autoincrement failed"));
                }
                const autoProp = this.metaModel.mapColNameToProp.get(this.table.autoIncrementField.name);
                /* istanbul ignore else */
                if (autoProp) {
                    autoProp.setDBValueIntoModel(input, res.lastID);
                }
            }
        }
        catch (e /* istanbul ignore next */) {
            return Promise.reject(new Error(`replace into '${this.table.name}' failed: ${e.message}`));
        }
        return input;
    }
    async updateInternal(input, keys) {
        try {
            const res = await this.sqldb.run(this.queryModel.getUpdateByIdStatement(keys), this.queryModel.bindAllInputParams(input, keys, true));
            if (!res.changes) {
                return Promise.reject(new Error(`update '${this.table.name}' failed: nothing changed`));
            }
        }
        catch (e) {
            return Promise.reject(new Error(`update '${this.table.name}' failed: ${e.message}`));
        }
        return input;
    }
}
// BaseDAO.options = { insertMode: BaseDAOInsertMode.StrictSqlite };
// BaseDAO.options = { insertMode: BaseDAOInsertMode.ForceAutoGeneration };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZURBTy5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzT1JNL0Jhc2VEQU8ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE9BQU8sRUFBVSxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBUyxNQUFNLG1CQUFtQixDQUFDO0FBRXBGOzs7O0dBSUc7QUFDSCxNQUFNLENBQU4sSUFBWSxpQkFLWDtBQUxELFdBQVksaUJBQWlCO0lBQzNCLCtGQUErRjtJQUMvRix5RUFBZ0IsQ0FBQTtJQUNoQixnSEFBZ0g7SUFDaEgsdUZBQXVCLENBQUE7QUFDekIsQ0FBQyxFQUxXLGlCQUFpQixLQUFqQixpQkFBaUIsUUFLNUI7QUFjRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQU8sT0FBTztJQUNsQixNQUFNLENBQUMsT0FBTyxDQUFrQjtJQUV2QixJQUFJLENBQWdCO0lBQ3BCLFNBQVMsQ0FBWTtJQUNyQixLQUFLLENBQVE7SUFDYixLQUFLLENBQWM7SUFDbkIsVUFBVSxDQUFnQjtJQUVuQzs7Ozs7T0FLRztJQUNILFlBQW1CLElBQW1CLEVBQUUsS0FBa0I7UUFDeEQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUMzQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBUSxFQUFFLElBQXdCO1FBQ3BELE9BQU8sSUFBSSxDQUFDLGNB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