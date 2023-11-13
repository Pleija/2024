import * as core from '../core/core.mjs';
import { qualifiySchemaIdentifier, quoteAndUnqualifyIdentifier, quoteIdentifier, quoteSimpleIdentifier, splitSchemaIdentifier, } from '../utils/index.mjs';
import { Field } from './Field.mjs';
/**
 * Class holding a table definition (name of the table and fields in the table)
 *
 * @export
 * @class Table
 */
export class Table {
    name;
    get quotedName() {
        return quoteIdentifier(this.name);
    }
    get schemaName() {
        return splitSchemaIdentifier(this.name).identSchema;
    }
    /**
     * Flag to indicate if this table should be created with the 'WITHOUT
     * ROWID'-clause
     */
    _withoutRowId;
    get withoutRowId() {
        return this._withoutRowId == undefined ? false : this._withoutRowId;
    }
    set withoutRowId(withoutRowId) {
        this._withoutRowId = withoutRowId;
    }
    get isWithoutRowIdDefined() {
        return this._withoutRowId == undefined ? false : true;
    }
    /**
     * Flag to indicate if AUTOINCREMENT should be enabled for a table having a
     * single-column INTEGER primary key
     * and withoutRowId is disabled
     */
    _autoIncrement;
    get autoIncrement() {
        return this._autoIncrement == undefined ? false : this._autoIncrement;
    }
    set autoIncrement(autoIncrement) {
        this._autoIncrement = autoIncrement;
    }
    get isAutoIncrementDefined() {
        return this._autoIncrement == undefined ? false : true;
    }
    /**
     * The fields defined for this table
     */
    fields = [];
    /**
     * The field mapped to the primary key; only set if using the
     * primary key column is alias for the rowId.
     */
    _rowIdField;
    get rowIdField() {
        return this._rowIdField;
    }
    /**
     * The field mapped to the primary key; only set if using the
     * AUTOINCREMENT feature
     */
    _autoIncrementField;
    get autoIncrementField() {
        return this._autoIncrementField;
    }
    // map column name to a field definition
    mapNameToField;
    // map column name to a identity field definition
    mapNameToIdentityField;
    // map constraint name to foreign key definition
    mapNameToFKDef;
    // map index name to index key definition
    mapNameToIDXDef;
    models;
    /**
     * Creates an instance of Table.
     *
     * @param name - The table name (containing the schema name if specified)
     */
    constructor(name) {
        this.name = name;
        this.mapNameToField = new Map();
        this.mapNameToIdentityField = new Map();
        this.mapNameToFKDef = new Map();
        this.mapNameToIDXDef = new Map();
        this.fields = [];
        this.models = new Set();
    }
    /**
     * Test if table has a column with the given column name
     *
     * @param colName - The name of the column
     */
    hasTableField(name) {
        return this.mapNameToField.get(name);
    }
    /**
     * Get the field definition for the given column name
     *
     * @param colName - The name of the column
     * @returns The field definition
     */
    getTableField(name) {
        const field = this.mapNameToField.get(name);
        if (!field) {
            throw new Error(`table '${this.name}': field '${name}' not registered yet`);
        }
        return field;
    }
    /**
     * Add a table field to this table
     *
     * @param name - The name of the column
     * @param isIdentity
     * @param [opts]
     * @param [propertyType]
     * @returns The field definition
     */
    getOrAddTableField(name, isIdentity, opts, propertyType) {
        let field = this.mapNameToField.get(name);
        if (!field) {
            // create field
            field = new Field(name, isIdentity, opts, propertyType);
            this.fields.push(field);
            this.mapNameToField.set(field.name, field);
            if (field.isIdentity) {
                this.mapNameToIdentityField.set(field.name, field);
            }
        }
        else {
            // merge field
            if (field.isIdentity !== isIdentity) {
                throw new Error(`conflicting identity setting: new: ${isIdentity}, old: ${field.isIdentity}`);
            }
            if (opts && opts.dbtype) {
                if (field.isDbTypeDefined && field.dbtype !== opts.dbtype) {
                    throw new Error(`conflicting dbtype setting: new: '${opts.dbtype}', old: '${field.dbtype}'`);
                }
                field.dbtype = opts.dbtype;
            }
            if (opts && opts.isJson != undefined) {
                if (field.isIsJsonDefined && field.isJson !== opts.isJson) {
                    throw new Error(`conflicting json setting: new: ${opts.isJson}, old: ${field.isJson}`);
                }
                field.isJson = opts.isJson;
            }
            if (opts && opts.dateInMilliSeconds != undefined) {
                if (field.isDateInMilliSecondsDefined &&
                    field.dateInMilliSeconds !== opts.dateInMilliSeconds) {
                    throw new Error(`conflicting dateInMilliSeconds setting: new: ${opts.dateInMilliSeconds}, old: ${field.dateInMilliSeconds}`);
                }
                field.dateInMilliSeconds = opts.dateInMilliSeconds;
            }
        }
        if (field.isIdentity) {
            if (!this.withoutRowId &&
                this.mapNameToIdentityField.size === 1 &&
                field.dbTypeInfo.typeAffinity === 'INTEGER') {
                this._rowIdField = field;
                if (this.autoIncrement) {
                    this._autoIncrementField = field;
                }
                else {
                    this._autoIncrementField = undefined;
                }
            }
            else {
                this._autoIncrementField = undefined;
                this._rowIdField = undefined;
            }
        }
        return field;
    }
    hasFKDefinition(name) {
        return this.mapNameToFKDef.get(name);
    }
    getFKDefinition(name) {
        const constraint = this.mapNameToFKDef.get(name);
        if (!constraint) {
            throw new Error(`table '${this.name}': foreign key constraint ${name} not registered yet`);
        }
        return constraint;
    }
    addFKDefinition(fkDef) {
        const oldFkDef = this.mapNameToFKDef.get(fkDef.name);
        if (!oldFkDef) {
            this.mapNameToFKDef.set(fkDef.name, fkDef);
        }
        else {
            // check conflicts
            if (oldFkDef.id !== fkDef.id) {
                core.debugORM(`table '${this.name}': conflicting foreign key definition for '${fkDef.name}'`);
                core.debugORM(`   old: ${oldFkDef.id}`);
                core.debugORM(`   new: ${fkDef.id}`);
                throw new Error(`table '${this.name}': conflicting foreign key definition for '${fkDef.name}'`);
            }
        }
        return fkDef;
    }
    hasIDXDefinition(name) {
        // NOTE: creating a index in schema1 on a table in schema2 is not supported by Sqlite3
        //  so using qualifiedIndentifier is currently not required
        return this.mapNameToIDXDef.get(qualifiySchemaIdentifier(name, this.schemaName));
    }
    getIDXDefinition(name) {
        // NOTE: creating a index in schema1 on a table in schema2 is not supported by Sqlite3
        //  so using qualifiedIndentifier is currently not required
        const idxDef = this.mapNameToIDXDef.get(qualifiySchemaIdentifier(name, this.schemaName));
        if (!idxDef) {
            throw new Error(`table '${this.name}': index ${name} not registered yet`);
        }
        return idxDef;
    }
    addIDXDefinition(idxDef) {
        // NOTE: creating a index in schema1 on a table in schema2 is not supported by Sqlite3
        //  so using qualifiedIndentifier is currently not required
        const qname = qualifiySchemaIdentifier(idxDef.name, this.schemaName);
        const oldIdxDef = this.mapNameToIDXDef.get(qname);
        if (!oldIdxDef) {
            this.mapNameToIDXDef.set(qname, idxDef);
        }
        else {
            // check conflicts
            if (oldIdxDef.id !== idxDef.id) {
                core.debugORM(`table '${this.name}': conflicting index definition for '${idxDef.name}'`);
                core.debugORM(`   old: ${oldIdxDef.id}`);
                core.debugORM(`   new: ${idxDef.id}`);
                throw new Error(`table '${this.name}': conflicting index definition '${idxDef.name}'`);
            }
        }
        return idxDef;
    }
    /**
     * Get 'CREATE TABLE'-statement using 'IF NOT EXISTS'-clause
     *
     * @returns The sql-statement
     */
    getCreateTableStatement(force) {
        return this.createCreateTableStatement(force);
    }
    /**
     * Get 'DROP TABLE'-statement
     *
     * @returns {string}
     */
    getDropTableStatement() {
        return `DROP TABLE IF EXISTS ${this.quotedName}`;
    }
    /**
     * Get 'ALTER TABLE...ADD COLUMN'-statement for the given column
     *
     * @param colName - The name of the column to add to the table
     * @returns The sql-statment
     */
    getAlterTableAddColumnStatement(colName) {
        let stmt = `ALTER TABLE ${this.quotedName}`;
        const field = this.getTableField(colName);
        stmt += ` ADD COLUMN ${field.quotedName} ${field.dbtype}`;
        return stmt;
    }
    /**
     * Get 'CREATE [UNIQUE] INDEX'-statement using 'IF NOT EXISTS'-clause
     *
     * @returns The sql-statement
     */
    getCreateIndexStatement(idxName, unique) {
        const idxDef = this.hasIDXDefinition(idxName);
        if (!idxDef) {
            throw new Error(`table '${this.name}': index '${idxName}' is not defined on table '${this.name}'`);
        }
        if (unique == undefined) {
            unique = idxDef.isUnique ? true : false;
        }
        const idxCols = idxDef.fields.map((field) => quoteSimpleIdentifier(field.name) + (field.desc ? ' DESC' : ''));
        return ('CREATE ' +
            (unique ? 'UNIQUE ' : ' ') +
            `INDEX IF NOT EXISTS ${quoteIdentifier(idxName)} ON ${quoteAndUnqualifyIdentifier(this.name)} ` +
            `(` +
            idxCols.join(', ') +
            ')');
    }
    /**
     * Get 'DROP TABLE'-statement
     *
     * @returns The sql-statement
     */
    getDropIndexStatement(idxName) {
        const idxDef = this.hasIDXDefinition(idxName);
        if (!idxDef) {
            throw new Error(`table '${this.name}': index '${idxName}' is not defined on table '${this.name}'`);
        }
        return `DROP INDEX IF EXISTS ${quoteIdentifier(idxName)}`;
    }
    /**
     * Generate SQL Statements
     *
     */
    createCreateTableStatement(force, addFields) {
        const colNamesPK = [];
        const colDefs = [];
        const quotedTableName = this.quotedName;
        /* istanbul ignore if */
        if (!this.fields.length) {
            throw new Error(`table '${this.name}': does not have any fields defined`);
        }
        this.fields.forEach((field) => {
            const quotedFieldName = field.quotedName;
            let colDef = `${quotedFieldName} ${field.dbtype}`;
            if (field.isIdentity) {
                colNamesPK.push(quotedFieldName);
                if (this.mapNameToIdentityField.size === 1) {
                    colDef += ' PRIMARY KEY';
                    if (this.autoIncrementField) {
                        colDef += ' AUTOINCREMENT';
                    }
                }
            }
            colDefs.push(colDef);
        });
        if (addFields) {
            addFields.forEach((field) => {
                const quotedFieldName = field.quotedName;
                colDefs.push(`${quotedFieldName} ${field.dbtype}`);
            });
        }
        // --------------------------------------------------------------
        // generate CREATE TABLE statement
        let stmt = 'CREATE TABLE ';
        if (!force) {
            stmt += 'IF NOT EXISTS ';
        }
        stmt += `${quotedTableName} (\n  `;
        // add column definitions
        stmt += colDefs.join(',\n  ');
        if (this.mapNameToIdentityField.size > 1) {
            // add multi-column primary key ćonstraint:
            stmt += ',\n  CONSTRAINT PRIMARY_KEY PRIMARY KEY (';
            stmt += colNamesPK.join(', ');
            stmt += ')';
        }
        // add foreign key constraint definition:
        this.mapNameToFKDef.forEach((fk, fkName) => {
            /* istanbul ignore if */
            if (!fk.fields.length || fk.fields.length !== fk.fields.length) {
                throw new Error(`table '${this.name}': foreign key constraint '${fkName}' definition is incomplete`);
            }
            stmt += `,\n  CONSTRAINT ${quoteSimpleIdentifier(fk.name)}\n`;
            stmt += `    FOREIGN KEY (`;
            stmt += fk.fields.map((field) => quoteSimpleIdentifier(field.name)).join(', ');
            stmt += ')\n';
            // if fk.foreignTableName has qualifier it must match the qualifier of this.name
            const { identName, identSchema } = splitSchemaIdentifier(fk.foreignTableName);
            const tableSchema = this.schemaName;
            /* istanbul ignore next */
            if (identSchema &&
                ((identSchema === 'main' && tableSchema && tableSchema !== identSchema) ||
                    (identSchema !== 'main' && (!tableSchema || tableSchema !== identSchema)))) {
                throw new Error(`table '${this.name}': foreign key '${fkName}' references table in wrong schema: '${fk.foreignTableName}'`);
            }
            stmt += `    REFERENCES ${quoteSimpleIdentifier(identName)} (`;
            stmt +=
                fk.fields.map((field) => quoteSimpleIdentifier(field.foreignColumnName)).join(', ') +
                    ') ON DELETE CASCADE'; // TODO: hard-coded 'ON DELETE CASCADE'
            stmt += '\n';
        });
        stmt += '\n)';
        if (this.withoutRowId) {
            stmt += ' WITHOUT ROWID';
        }
        return stmt;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFibGUubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9Db21tb24vU3FsaXRlM09STS9tZXRhZGF0YS9UYWJsZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLElBQUksTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsd0JBQXdCLEVBQ3hCLDJCQUEyQixFQUMzQixlQUFlLEVBQ2YscUJBQXFCLEVBQ3JCLHFCQUFxQixHQUN0QixNQUFNLG9CQUFvQixDQUFDO0FBRzVCLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFNcEM7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sS0FBSztJQXNGbUI7SUFyRm5DLElBQUksVUFBVTtRQUNaLE9BQU8sZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1osT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDO0lBQ3RELENBQUM7SUFFRDs7O09BR0c7SUFDSyxhQUFhLENBQVc7SUFFaEMsSUFBSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQ3RFLENBQUM7SUFDRCxJQUFJLFlBQVksQ0FBQyxZQUFxQjtRQUNwQyxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztJQUNwQyxDQUFDO0lBQ0QsSUFBSSxxQkFBcUI7UUFDdkIsT0FBTyxJQUFJLENBQUMsYUFBYSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxjQUFjLENBQVc7SUFFakMsSUFBSSxhQUFh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