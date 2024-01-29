import { QueryType } from "../../Common/Enum";
import { Uuid } from "../../Common/Uuid";
import { RowVersionColumn } from "../../Decorator/Column/RowVersionColumn";
import { entityMetaKey } from "../../Decorator/DecoratorKey";
import { FunctionExpression } from "../../ExpressionBuilder/Expression/FunctionExpression";
import { ValueExpression } from "../../ExpressionBuilder/Expression/ValueExpression";
import { ExpressionBuilder } from "../../ExpressionBuilder/ExpressionBuilder";
import { clone, isNull } from "../../Helper/Util";
import { BinaryColumnMetaData } from "../../MetaData/BinaryColumnMetaData";
import { BooleanColumnMetaData } from "../../MetaData/BooleanColumnMetaData";
import { CheckConstraintMetaData } from "../../MetaData/CheckConstraintMetaData";
import { ColumnMetaData } from "../../MetaData/ColumnMetaData";
import { DateColumnMetaData } from "../../MetaData/DateColumnMetaData";
import { DateTimeColumnMetaData } from "../../MetaData/DateTimeColumnMetaData";
import { DecimalColumnMetaData } from "../../MetaData/DecimalColumnMetaData";
import { EnumColumnMetaData } from "../../MetaData/EnumColumnMetaData";
import { IdentifierColumnMetaData } from "../../MetaData/IdentifierColumnMetaData";
import { IntegerColumnMetaData } from "../../MetaData/IntegerColumnMetaData";
import { RealColumnMetaData } from "../../MetaData/RealColumnMetaData";
import { RelationDataMetaData } from "../../MetaData/Relation/RelationDataMetaData";
import { RowVersionColumnMetaData } from "../../MetaData/RowVersionColumnMetaData";
import { SerializeColumnMetaData } from "../../MetaData/SerializeColumnMetaData";
import { StringColumnMetaData } from "../../MetaData/StringColumnMetaData";
import { TempEntityMetaData } from "../../MetaData/TempEntityMetaData";
import { TimeColumnMetaData } from "../../MetaData/TimeColumnMetaData";
const isColumnsEquals = (cols1, cols2) => {
    return cols1.length === cols2.length && cols1.all((o) => cols2.any((p) => p.columnName === o.columnName));
};
const isIndexEquals = (index1, index2) => {
    return !!index1.unique === !!index2.unique && isColumnsEquals(index1.columns, index1.columns);
};
export class RelationalSchemaBuilder {
    constructor() {
        this.option = {};
        // protected rebuildEntitySchema<T>(schema: IEntityMetaData<T>, oldSchema: IEntityMetaData<T>) {
        //     const columnMetas = schema.columns.select(o => ({
        //         columnSchema: o,
        //         oldColumnSchema: oldSchema.columns.first(c => c.columnName === o.columnName)
        //     }));
        //     let result: IQuery[] = [];
        //     const cloneSchema = Object.assign({}, schema);
        //     cloneSchema.name = "TEMP_" + this.queryBuilder.newAlias();
        //     result = result.concat(this.createEntitySchema(cloneSchema));
        //     // turn on identity insert coz rebuild schema most likely called because identity insert issue.
        //     result.push({
        //         query: `SET IDENTITY_INSERT ${this.entityName(cloneSchema)} ON`,
        //         type: QueryType.DCL
        //     });
        //     // copy value
        //     const newColumns = columnMetas.where(o => !!o.oldColumnSchema).select(o => this.queryBuilder.enclose(o.columnSchema.columnName)).toArray().join(",");
        //     const copyColumns = columnMetas.where(o => !!o.oldColumnSchema).select(o => this.queryBuilder.enclose(o.oldColumnSchema.columnName)).toArray().join(",");
        //     result.push({
        //         query: `INSERT INTO ${this.entityName(cloneSchema)} (${newColumns}) SELECT ${copyColumns} FROM ${this.entityName(oldSchema)} WITH (HOLDLOCK TABLOCKX)`,
        //         type: QueryType.DML
        //     });
        //     // turn of identity insert
        //     result.push({
        //         query: `SET IDENTITY_INSERT ${this.entityName(cloneSchema)} OFF`,
        //         type: QueryType.DCL
        //     });
        //     // remove all foreignkey reference to current table
        //     result = result.concat(this.dropAllMasterRelations(oldSchema));
        //     // rename temp table
        //     result = result.concat(this.renameTable(cloneSchema, this.entityName(schema)));
        //     // re-add all foreignkey reference to table
        //     result = result.concat(this.addAllMasterRelations(schema));
        //     return result;
        // }
    }
    addColumn(columnMeta) {
        const query = `ALTER TABLE ${this.entityName(columnMeta.entity)} ADD ${this.columnDeclaration(columnMeta, "add")}`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    addConstraint(constraintMeta) {
        const query = `ALTER TABLE ${this.entityName(constraintMeta.entity)}` +
            ` ADD CONSTRAINT ${this.constraintDeclaration(constraintMeta)}`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    addDefaultContraint(columnMeta) {
        const query = `ALTER TABLE ${this.entityName(columnMeta.entity)} ALTER COLUMN ${this.queryBuilder.enclose(columnMeta.columnName)}` +
            ` SET DEFAULT ${this.defaultValue(columnMeta)}`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    addForeignKey(relationMeta) {
        const result = [];
        if (relationMeta.reverseRelation) {
            result.push({
                query: `ALTER TABLE ${this.entityName(relationMeta.source)} ADD ${this.foreignKeyDeclaration(relationMeta)}`,
                type: QueryType.DDL
            });
        }
        return result;
    }
    addIndex(indexMeta) {
        const columns = indexMeta.columns.select((o) => this.queryBuilder.enclose(o.columnName)).toArray().join(",");
        const query = `CREATE${indexMeta.unique ? " UNIQUE" : ""} INDEX ${indexMeta.name} ON ${this.entityName(indexMeta.entity)} (${columns})`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    addPrimaryKey(entityMeta) {
        const query = `ALTER TABLE ${this.entityName(entityMeta)} ADD ${this.primaryKeyDeclaration(entityMeta)}`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    alterColumn(columnMeta) {
        const query = `ALTER TABLE ${this.entityName(columnMeta.entity)} ALTER COLUMN ${this.columnDeclaration(columnMeta, "alter")}`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    createTable(entityMetaData, name) {
        const columnDefinitions = entityMetaData.columns.where((o) => !!o.columnName).select((o) => this.columnDeclaration(o, "create")).toArray().join("," + this.queryBuilder.newLine(1, false));
        const constraints = (entityMetaData.constraints || []).select((o) => this.constraintDeclaration(o)).toArray().join("," + this.queryBuilder.newLine(1, false));
        let tableName = this.entityName(entityMetaData);
        if (name) {
            const oldName = entityMetaData.name;
            entityMetaData.name = name;
            tableName = this.entityName(entityMetaData);
            entityMetaData.name = oldName;
        }
        const tableModifier = entityMetaData instanceof TempEntityMetaData ? "TEMPORARY TABLE" : "TABLE";
        const query = `CREATE ${tableModifier} ${tableName}` +
            `${this.queryBuilder.newLine()}(` +
            `${this.queryBuilder.newLine(1, false)}${columnDefinitions}` +
            `,${this.queryBuilder.newLine(1, false)}${this.primaryKeyDeclaration(entityMetaData)}` +
            (constraints ? `,${this.queryBuilder.newLine(1, false)}${constraints}` : "") +
            `${this.queryBuilder.newLine()})`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    dropColumn(columnMeta) {
        const query = `ALTER TABLE ${this.entityName(columnMeta.entity)} DROP COLUMN ${this.queryBuilder.enclose(columnMeta.columnName)}`;
        return [{
                query,
                type: QueryType.DDL,
                comment: "You might lost your data"
            }];
    }
    dropConstraint(constraintMeta) {
        const query = `ALTER TABLE ${this.entityName(constraintMeta.entity)} DROP CONSTRAINT ${this.queryBuilder.enclose(constraintMeta.name)}`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    dropDefaultContraint(columnMeta) {
        const query = `ALTER TABLE ${this.entityName(columnMeta.entity)} ALTER COLUMN ${this.queryBuilder.enclose(columnMeta.columnName)}` +
            ` DROP DEFAULT`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    dropForeignKey(relationMeta) {
        const query = `ALTER TABLE ${this.entityName(relationMeta.source)} DROP CONSTRAINT ${this.queryBuilder.enclose(relationMeta.fullName)}`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    dropIndex(indexMeta) {
        const query = `DROP INDEX ${indexMeta.name}`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    dropPrimaryKey(entityMeta) {
        const pkName = "PK_" + entityMeta.name;
        const query = `ALTER TABLE ${this.entityName(entityMeta)} DROP CONSTRAINT ${this.queryBuilder.enclose(pkName)}`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    dropTable(entityMeta) {
        const query = `DROP TABLE ${this.entityName(entityMeta)}`;
        return [{
                query,
                type: QueryType.DDL,
                comment: "You might lost your data"
            }];
    }
    async getSchemaQuery(entityTypes) {
        let commitQueries = [];
        let rollbackQueries = [];
        const defSchemaResult = (await this.connection.query({
            query: `SELECT SCHEMA_NAME() AS ${this.queryBuilder.enclose("SCHEMA")}`,
            type: QueryType.DQL
        })).first().rows;
        const defaultSchema = defSchemaResult.first().SCHEMA;
        const schemas = entityTypes.select((o) => Reflect.getOwnMetadata(entityMetaKey, o)).toArray();
        for (const schema of schemas) {
            if (!schema.schema) {
                schema.schema = defaultSchema;
            }
        }
        const oldSchemas = await this.loadSchemas(schemas);
        const schemaMaps = schemas.fullJoin(oldSchemas, (o1, o2) => o1.schema.toLowerCase() === o2.schema.toLowerCase() && o1.name.toLowerCase() === o2.name.toLowerCase(), (o1, o2) => ({
            schema: o1,
            oldSchema: o2
        }));
        let preCommitQueries = [];
        let preRollbackQueries = [];
        let postCommitQueries = [];
        let postRollbackQueries = [];
        for (const schemaMap of schemaMaps) {
            const schema = schemaMap.schema;
            const oldSchema = schemaMap.oldSchema;
            if (schema && oldSchema) {
                preCommitQueries = preCommitQueries.concat(this.dropAllOldRelations(schema, oldSchema));
                commitQueries = commitQueries.concat(this.updateEntitySchema(schema, oldSchema));
                postCommitQueries = postCommitQueries.concat(this.addAllNewRelations(schema, oldSchema));
                preRollbackQueries = preRollbackQueries.concat(this.dropAllOldRelations(oldSchema, schema));
                rollbackQueries = rollbackQueries.concat(this.updateEntitySchema(oldSchema, schema));
                postRollbackQueries = postRollbackQueries.concat(this.addAllNewRelations(oldSchema, schema));
            }
            else if (!oldSchema) {
                preRollbackQueries = preRollbackQueries.concat(schema.relations.where((o) => !o.isMaster).selectMany((o) => this.dropForeignKey(o)).toArray());
                rollbackQueries = rollbackQueries.concat(this.dropTable(schema));
                commitQueries = commitQueries.concat(this.createEntitySchema(schema));
                postCommitQueries = postCommitQueries.concat(schema.relations.where((o) => !o.isMaster).selectMany((o) => this.addForeignKey(o)).toArray());
            }
            else {
                if (this.option.removeUnmappedEntites) {
                    preRollbackQueries = preRollbackQueries.concat(oldSchema.relations.where((o) => !o.isMaster).selectMany((o) => this.dropForeignKey(o)).toArray());
                    rollbackQueries = rollbackQueries.concat(this.dropTable(oldSchema));
                    commitQueries = commitQueries.concat(this.createEntitySchema(oldSchema));
                    postCommitQueries = postCommitQueries.concat(oldSchema.relations.where((o) => !o.isMaster).selectMany((o) => this.addForeignKey(o)).toArray());
                }
            }
        }
        return {
            commit: preCommitQueries.concat(commitQueries, postCommitQueries),
            rollback: preRollbackQueries.concat(rollbackQueries, postRollbackQueries)
        };
    }
    async loadSchemas(entities) {
        const schemaGroups = entities.groupBy((o) => o.schema).toArray();
        const tableFilters = `TABLE_CATALOG = '${this.connection.database}' AND (${schemaGroups.select((o) => `TABLE_SCHEMA = '${o.key}' AND TABLE_NAME IN (${o.select((p) => this.queryBuilder.valueString(p.name)).toArray().join(",")})`).toArray().join(") OR (")})`;
        const batchedQuery = [];
        // table schema
        batchedQuery.push({
            query: `SELECT * FROM ${this.queryBuilder.enclose(this.connection.database)}.INFORMATION_SCHEMA.TABLES WHERE ${tableFilters};`,
            type: QueryType.DQL
        });
        // column schema
        batchedQuery.push({
            query: `SELECT *, CAST(COLUMNPROPERTY(object_id(CONCAT(TABLE_SCHEMA, '.', TABLE_NAME)), COLUMN_NAME, 'IsIdentity') AS BIT) [IS_IDENTITY] FROM ${this.queryBuilder.enclose(this.connection.database)}.INFORMATION_SCHEMA.COLUMNS WHERE ${tableFilters}`,
            type: QueryType.DQL
        });
        batchedQuery.push({
            query: `SELECT a.*, b.CHECK_CLAUSE INTO #tempConstraint FROM ${this.queryBuilder.enclose(this.connection.database)}.INFORMATION_SCHEMA.TABLE_CONSTRAINTS a` +
                ` LEFT JOIN  ${this.queryBuilder.enclose(this.connection.database)}.INFORMATION_SCHEMA.CHECK_CONSTRAINTS b` +
                ` on a.CONSTRAINT_NAME = b.CONSTRAINT_NAME` +
                ` WHERE ${tableFilters}`,
            type: QueryType.DDL | QueryType.DML
        });
        // all table constrains
        batchedQuery.push({
            query: `SELECT * FROM #tempConstraint`,
            type: QueryType.DQL
        });
        // relation constraint for FK
        batchedQuery.push({
            query: `SELECT a.* FROM ${this.queryBuilder.enclose(this.connection.database)}.INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS a` +
                ` JOIN #tempConstraint b ON a.CONSTRAINT_NAME = b.CONSTRAINT_NAME WHERE ${tableFilters}`,
            type: QueryType.DQL
        });
        batchedQuery.push({
            query: `DROP TABLE #tempConstraint`,
            type: QueryType.DDL
        });
        // map constrain to column
        batchedQuery.push({
            query: `SELECT * FROM ${this.queryBuilder.enclose(this.connection.database)}.INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE WHERE ${tableFilters}`,
            type: QueryType.DQL
        });
        // all table index
        batchedQuery.push({
            query: `SELECT s.name [TABLE_SCHEMA], t.name [TABLE_NAME], i.name [INDEX_NAME], i.is_unique [IS_UNIQUE], i.type_desc [TYPE], c.name [COLUMN_NAME]` +
                ` from ${this.queryBuilder.enclose(this.connection.database)}.sys.index_columns ic` +
                ` join ${this.queryBuilder.enclose(this.connection.database)}.sys.columns c on ic.object_id = c.object_id and ic.column_id = c.column_id` +
                ` join ${this.queryBuilder.enclose(this.connection.database)}.sys.indexes i on i.index_id = ic.index_id` +
                ` join ${this.queryBuilder.enclose(this.connection.database)}.sys.tables t on t.object_id = i.object_id` +
                ` join ${this.queryBuilder.enclose(this.connection.database)}.sys.schemas s on t.schema_id = s.schema_id` +
                ` where i.is_primary_key = 0 and i.is_unique_constraint = 0 AND t.is_ms_shipped = 0` +
                ` and (${schemaGroups.select((o) => `s.name = '${o.key}' AND t.name IN (${o.select((p) => this.queryBuilder.valueString(p.name)).toArray().join(",")})`).toArray().join(") OR (")})` +
                ` order by [TABLE_SCHEMA], [TABLE_NAME], [INDEX_NAME]`,
            type: QueryType.DQL
        });
        const schemaDatas = await this.connection.query(...batchedQuery);
        const tableSchemas = schemaDatas[0];
        const columnSchemas = schemaDatas[1];
        const constriantSchemas = schemaDatas[3];
        const constraintColumnSchemas = schemaDatas[6];
        const foreignKeySchemas = schemaDatas[4];
        const indexSchemas = schemaDatas[7];
        // convert all schema to entityMetaData for comparison
        const result = {};
        const constraints = {};
        for (const tableSchema of tableSchemas.rows) {
            const entity = {
                schema: tableSchema.TABLE_SCHEMA,
                name: tableSchema.TABLE_NAME,
                primaryKeys: [],
                columns: [],
                indices: [],
                constraints: [],
                relations: [],
                type: Object,
                allowInheritance: false,
                inheritance: null
            };
            result[entity.schema + "." + entity.name] = entity;
        }
        for (const columnSchema of columnSchemas.rows) {
            let defaultExpression = columnSchema.COLUMN_DEFAULT;
            const column = {
                columnName: columnSchema.COLUMN_NAME,
                nullable: columnSchema.IS_NULLABLE === "YES",
                columnType: columnSchema.DATA_TYPE,
                charset: columnSchema.CHARACTER_SET_NAME,
                collation: columnSchema.COLLATION_NAME
            };
            if (defaultExpression) {
                while (defaultExpression[0] === "(" && defaultExpression[defaultExpression.length - 1] === ")") {
                    defaultExpression = defaultExpression.substring(1, defaultExpression.length - 1);
                }
                const body = new ValueExpression(undefined, defaultExpression);
                const defaultExp = new FunctionExpression(body, []);
                column.defaultExp = defaultExp;
            }
            const typeMap = this.columnType(column);
            switch (typeMap.group) {
                case "Binary":
                    column.size = columnSchema.CHARACTER_MAXIMUM_LENGTH;
                    break;
                case "String":
                    column.length = columnSchema.CHARACTER_MAXIMUM_LENGTH;
                    break;
                case "DateTime":
                case "Time":
                    column.precision = columnSchema.DATETIME_PRECISION;
                    break;
                case "Decimal":
                    column.scale = columnSchema.NUMERIC_SCALE;
                    column.precision = columnSchema.NUMERIC_PRECISION;
                    break;
                case "Real":
                    column.size = columnSchema.NUMERIC_PRECISION;
                    break;
                case "Integer":
                    // NOTE: work around coz information schema did not contain int storage size (bytes)
                    column.size = Math.round(columnSchema.NUMERIC_PRECISION / 2.5);
                    column.autoIncrement = columnSchema.IS_IDENTITY;
                    break;
            }
            const entity = result[columnSchema.TABLE_SCHEMA + "." + columnSchema.TABLE_NAME];
            column.entity = entity;
            entity.columns.push(column);
        }
        for (const constraint of constriantSchemas.rows) {
            const entity = result[constraint.TABLE_SCHEMA + "." + constraint.TABLE_NAME];
            const name = constraint.CONSTRAINT_NAME;
            const type = constraint.CONSTRAINT_TYPE;
            const columns = [];
            let constraintMeta = {
                name: name,
                entity: entity,
                columns
            };
            if (type === "CHECK") {
                const checkDefinition = constraint.CHECK_CLAUSE;
                const checkExp = new ValueExpression(undefined, checkDefinition);
                constraintMeta = new CheckConstraintMetaData(name, entity, checkExp);
                constraintMeta.columns = columns;
            }
            constraints[name] = {
                meta: constraintMeta,
                type: type
            };
        }
        for (const constraint of constraintColumnSchemas.rows) {
            const entity = result[constraint.TABLE_SCHEMA + "." + constraint.TABLE_NAME];
            const name = constraint.CONSTRAINT_NAME;
            const column = constraint.COLUMN_NAME;
            const constraintData = constraints[name];
            const columnMeta = entity.columns.first((o) => o.columnName === column);
            constraintData.meta.columns.push(columnMeta);
            switch (constraintData.type) {
                case "PRIMARY KEY":
                    entity.primaryKeys.push(columnMeta);
                    break;
                case "CHECK":
                case "UNIQUE":
                    entity.constraints.add(constraintData.meta);
                    break;
            }
        }
        for (const relationSchema of foreignKeySchemas.rows) {
            const relationName = relationSchema.CONSTRAINT_NAME;
            const foreignKey = constraints[relationName];
            const targetConstraint = constraints[relationSchema.UNIQUE_CONSTRAINT_NAME];
            const relationType = foreignKey.meta.columns.all((o) => foreignKey.meta.entity.primaryKeys.contains(o)) ? "one" : "many";
            const updateOption = relationSchema.UPDATE_RULE;
            const deleteOption = relationSchema.DELETE_RULE;
            const fkRelation = {
                source: foreignKey.meta.entity,
                target: null,
                fullName: relationName,
                relationColumns: foreignKey.meta.columns,
                isMaster: false,
                relationType: relationType,
                relationMaps: new Map(),
                updateOption: updateOption,
                deleteOption: deleteOption
            };
            foreignKey.meta.entity.relations.push(fkRelation);
            if (targetConstraint) {
                fkRelation.target = targetConstraint.meta.entity;
                const reverseFkRelation = {
                    source: targetConstraint.meta.entity,
                    target: foreignKey.meta.entity,
                    fullName: relationName,
                    relationColumns: targetConstraint.meta.columns,
                    isMaster: true,
                    relationType: "one",
                    reverseRelation: fkRelation,
                    relationMaps: new Map()
                };
                fkRelation.reverseRelation = reverseFkRelation;
                // set relationmaps
                for (let i = 0, len = fkRelation.relationColumns.length; i < len; i++) {
                    const fkColumn = fkRelation.relationColumns[i];
                    const masterColumn = reverseFkRelation.relationColumns[i];
                    fkRelation.relationMaps.set(fkColumn, masterColumn);
                    reverseFkRelation.relationMaps.set(masterColumn, fkColumn);
                }
                targetConstraint.meta.entity.relations.push(reverseFkRelation);
            }
        }
        for (const indexSchema of indexSchemas.rows) {
            const entity = result[indexSchema.TABLE_SCHEMA + "." + indexSchema.TABLE_NAME];
            const indexName = indexSchema.INDEX_NAME;
            let index = entity.indices.first((o) => o.name === indexName);
            if (!index) {
                index = {
                    name: indexName,
                    columns: [],
                    entity: entity,
                    unique: indexSchema.IS_UNIQUE
                    // type: indexSchema["TYPE"]
                };
                entity.indices.push(index);
            }
            const column = entity.columns.first((o) => o.columnName === indexSchema.COLUMN_NAME);
            if (column) {
                index.columns.push(column);
            }
        }
        return Object.keys(result).select((o) => result[o]).toArray();
    }
    renameColumn(columnMeta, newName) {
        const query = `EXEC sp_rename '${this.entityName(columnMeta.entity)}.${this.queryBuilder.enclose(columnMeta.columnName)}', '${newName}', 'COLUMN'`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    renameTable(entityMetaData, newName) {
        const query = `EXEC sp_rename '${this.entityName(entityMetaData)}', '${this.queryBuilder.enclose(newName)}', 'OBJECT'`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    addAllMasterRelations(entityMeta) {
        return entityMeta.relations.where((o) => o.isMaster)
            .selectMany((o) => this.addForeignKey(o.reverseRelation)).toArray();
    }
    addAllNewRelations(schema, oldSchema) {
        const oldRelations = oldSchema.relations.where((o) => !o.isMaster).toArray();
        return schema.relations.where((o) => !o.isMaster && !!o.reverseRelation)
            .where((o) => !oldRelations.any((or) => isColumnsEquals(o.relationColumns, or.relationColumns) && isColumnsEquals(o.reverseRelation.relationColumns, or.reverseRelation.relationColumns)))
            .selectMany((o) => this.addForeignKey(o)).toArray();
    }
    columnDeclaration(columnMeta, type = "alter") {
        let result = `${this.queryBuilder.enclose(columnMeta.columnName)} ${this.queryBuilder.columnTypeString(this.columnType(columnMeta))}`;
        if (type !== "alter" && columnMeta.defaultExp) {
            result += ` DEFAULT ${this.defaultValue(columnMeta)}`;
        }
        if (columnMeta.collation) {
            result += " COLLATE " + columnMeta.collation;
        }
        if (columnMeta.nullable !== true) {
            result += " NOT NULL";
        }
        if (type !== "alter" && columnMeta.autoIncrement) {
            result += " IDENTITY(1,1)";
        }
        if (type === "create" && columnMeta.description) {
            result += " COMMENT " + this.queryBuilder.valueString(columnMeta.description);
        }
        return result;
    }
    columnType(column) {
        let columnType;
        if (this.columnTypeMap.has(column.columnType)) {
            columnType = this.columnTypeMap.get(column.columnType);
        }
        else if (column instanceof BooleanColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultBoolean");
        }
        else if (column instanceof IntegerColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultBoolean");
        }
        else if (column instanceof DecimalColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultBoolean");
        }
        else if (column instanceof IdentifierColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultInteger");
        }
        else if (column instanceof DateColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultDate");
        }
        else if (column instanceof EnumColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultEnum");
        }
        else if (column instanceof RowVersionColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultRowVersion");
        }
        else if (column instanceof TimeColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultTime");
        }
        else if (column instanceof DateTimeColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultDateTime");
        }
        else if (column instanceof SerializeColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultSerialize");
        }
        else if (column instanceof BinaryColumnMetaData) {
            columnType = this.columnTypeMap.get("defaultBinary");
        }
        if (!columnType) {
            throw new Error(`column type '${column.columnType}' is not supported`);
        }
        columnType = clone(columnType, true);
        if (columnType.option) {
            switch (columnType.group) {
                case "Binary": {
                    const size = column.size;
                    if (!isNull(size)) {
                        columnType.option.size = size;
                    }
                    break;
                }
                case "String": {
                    const length = column.length;
                    if (!isNull(length)) {
                        columnType.option.length = length;
                    }
                    break;
                }
                case "DateTime":
                case "Time": {
                    const precision = column.precision;
                    if (!isNull(precision)) {
                        columnType.option.precision = precision;
                    }
                    break;
                }
                case "Decimal": {
                    const scale = column.scale;
                    const precision = column.precision;
                    if (!isNull(scale)) {
                        columnType.option.scale = scale;
                    }
                    if (!isNull(precision)) {
                        columnType.option.precision = precision;
                    }
                    break;
                }
                case "Integer":
                case "Real": {
                    const size = column.size;
                    if (!isNull(size)) {
                        columnType.option.size = size;
                    }
                    break;
                }
            }
        }
        return columnType;
    }
    constraintDeclaration(constraintMeta) {
        let result = "";
        if (constraintMeta.definition) {
            const checkConstriant = constraintMeta;
            const definition = checkConstriant.getDefinitionString(this.queryBuilder);
            result = `CONSTRAINT ${this.queryBuilder.enclose(constraintMeta.name)} CHECK (${definition})`;
        }
        else {
            const columns = constraintMeta.columns.select((o) => this.queryBuilder.enclose(o.columnName)).toArray().join(",");
            result = `CONSTRAINT ${this.queryBuilder.enclose(constraintMeta.name)} UNIQUE (${columns})`;
        }
        return result;
    }
    createEntitySchema(schema) {
        return this.createTable(schema)
            .union(schema.indices.selectMany((o) => this.addIndex(o)))
            .toArray();
    }
    defaultValue(columnMeta) {
        if (columnMeta.defaultExp) {
            return this.queryBuilder.toString(columnMeta.defaultExp.body);
        }
        let groupType;
        if (!(columnMeta instanceof ColumnMetaData)) {
            const columnTypeMap = this.columnTypeMap.get(columnMeta.columnType);
            if (columnTypeMap) {
                groupType = columnTypeMap.group;
            }
        }
        if (columnMeta instanceof IntegerColumnMetaData
            || columnMeta instanceof DecimalColumnMetaData
            || columnMeta instanceof RealColumnMetaData
            || groupType === "Integer" || groupType === "Decimal" || groupType === "Real") {
            return this.queryBuilder.valueString(0);
        }
        if (columnMeta instanceof IdentifierColumnMetaData || groupType === "Identifier") {
            /* istanbul ignore next */
            return this.queryBuilder.toString(ExpressionBuilder.parse(() => Uuid.new()).body);
        }
        if (columnMeta instanceof StringColumnMetaData
            || columnMeta instanceof SerializeColumnMetaData
            || groupType === "String" || groupType === "Serialize") {
            return this.queryBuilder.valueString("");
        }
        if (columnMeta instanceof DateColumnMetaData
            || columnMeta instanceof DateTimeColumnMetaData
            || groupType === "Date" || groupType === "DateTime") {
            // Result: GETUTCDATE()
            /* istanbul ignore next */
            return this.queryBuilder.toString(ExpressionBuilder.parse(() => Date.utcTimestamp()).body);
        }
        if (columnMeta instanceof TimeColumnMetaData || groupType === "Time") {
            // Result: CONVERT(TIME, GETUTCDATE())
            /* istanbul ignore next */
            return this.queryBuilder.toString(ExpressionBuilder.parse(() => Date.utcTimestamp().toTime()).body);
        }
        if (columnMeta instanceof RowVersionColumn || groupType === "RowVersion") {
            // Result: CURRENT_TIMESTAMP;
            /* istanbul ignore next */
            return this.queryBuilder.toString(ExpressionBuilder.parse(() => Date.timestamp()).body);
        }
        if (columnMeta instanceof BinaryColumnMetaData || groupType === "Binary") {
            return this.queryBuilder.valueString(new Uint8Array(0));
        }
        throw new Error(`${columnMeta.columnType} not supported`);
    }
    dropAllMasterRelations(entityMeta) {
        return entityMeta.relations.where((o) => o.isMaster)
            .selectMany((o) => this.dropForeignKey(o.reverseRelation)).toArray();
    }
    dropAllOldRelations(schema, oldSchema) {
        const isRelationData = schema instanceof RelationDataMetaData || oldSchema instanceof RelationDataMetaData;
        if (isRelationData) {
            // TODO
            return [];
        }
        else {
            const relations = schema.relations.where((o) => !o.isMaster).toArray();
            return oldSchema.relations.where((o) => !o.isMaster)
                .where((o) => !relations.any((or) => isColumnsEquals(o.relationColumns, or.relationColumns) && isColumnsEquals(o.reverseRelation.relationColumns, or.reverseRelation.relationColumns)))
                .selectMany((o) => this.dropForeignKey(o)).toArray();
        }
    }
    entityName(entityMeta) {
        return `${entityMeta.schema ? this.queryBuilder.enclose(entityMeta.schema) + "." : ""}${this.queryBuilder.enclose(entityMeta.name)}`;
    }
    foreignKeyDeclaration(relationMeta) {
        const columns = relationMeta.relationColumns.select((o) => this.queryBuilder.enclose(o.columnName)).toArray().join(", ");
        const referenceColumns = relationMeta.reverseRelation.relationColumns.select((o) => this.queryBuilder.enclose(o.columnName)).toArray().join(", ");
        let result = `CONSTRAINT ${this.queryBuilder.enclose(relationMeta.fullName)}` +
            ` FOREIGN KEY (${columns})` +
            ` REFERENCES ${this.entityName(relationMeta.target)} (${referenceColumns})`;
        if (relationMeta.updateOption && relationMeta.updateOption !== "NO ACTION") {
            result += ` ON UPDATE ${relationMeta.updateOption}`;
        }
        if (relationMeta.deleteOption && relationMeta.deleteOption !== "NO ACTION") {
            result += ` ON DELETE ${relationMeta.deleteOption}`;
        }
        return result;
    }
    getColumnChanges(columnSchema, oldColumnSchema) {
        let result = [];
        const entitySchema = oldColumnSchema.entity;
        // If auto increment, column must be not nullable.
        const isNullableChange = (!!columnSchema.nullable && !columnSchema.autoIncrement) !== (!!oldColumnSchema.nullable && !oldColumnSchema.autoIncrement);
        const isIdentityChange = !!columnSchema.autoIncrement !== !!oldColumnSchema.autoIncrement;
        const isColumnChange = isNullableChange
            || this.queryBuilder.columnTypeString(this.columnType(columnSchema)) !== this.queryBuilder.columnTypeString(this.columnType(oldColumnSchema))
            || (columnSchema.collation && oldColumnSchema.collation && columnSchema.collation !== oldColumnSchema.collation);
        const isDefaultChange = isColumnChange || (columnSchema.defaultExp ? this.defaultValue(columnSchema) : null) !== (oldColumnSchema.defaultExp ? this.defaultValue(oldColumnSchema) : null);
        if (isDefaultChange && oldColumnSchema.defaultExp) {
            result = result.concat(this.dropDefaultContraint(oldColumnSchema));
        }
        if (isNullableChange) {
            if (!columnSchema.nullable && !oldColumnSchema.autoIncrement) {
                // if change from nullable to not nullable, set all existing data to default value.
                const fallbackValue = this.defaultValue(columnSchema);
                result.push({
                    query: `UPDATE ${this.entityName(entitySchema)} SET ${this.queryBuilder.enclose(columnSchema.columnName)} = ${fallbackValue} WHERE ${this.queryBuilder.enclose(columnSchema.columnName)} IS NULL`,
                    type: QueryType.DML
                });
            }
        }
        if (isIdentityChange) {
            const toAutoIncrement = columnSchema.autoIncrement;
            // add new column.
            const newName = "NEW_" + columnSchema.columnName;
            const cloneColumn = Object.assign({}, columnSchema);
            cloneColumn.columnName = newName;
            cloneColumn.entity = oldColumnSchema.entity;
            result = result.concat(this.addColumn(cloneColumn));
            // turn on identity insert coz rebuild schema most likely called because identity insert issue.
            if (toAutoIncrement) {
                result.push({
                    query: `SET IDENTITY_INSERT ${this.entityName(entitySchema)} ON`,
                    type: QueryType.DCL
                });
            }
            // compilation will failed without exec
            result.push({
                query: `EXEC('UPDATE ${this.entityName(entitySchema)} WITH (HOLDLOCK TABLOCKX) SET ${this.queryBuilder.enclose(cloneColumn.columnName)} = ${this.queryBuilder.enclose(oldColumnSchema.columnName)}')`,
                type: QueryType.DML
            });
            if (toAutoIncrement) {
                result.push({
                    query: `SET IDENTITY_INSERT ${this.entityName(entitySchema)} OFF`,
                    type: QueryType.DCL
                });
            }
            // remove old column
            result = result.concat(this.dropColumn(oldColumnSchema));
            // rename temp column
            result = result.concat(this.renameColumn(cloneColumn, columnSchema.columnName));
        }
        else if (isColumnChange) {
            result = result.concat(this.alterColumn(columnSchema));
        }
        if (isDefaultChange && columnSchema.defaultExp) {
            result = result.concat(this.addDefaultContraint(columnSchema));
        }
        return result;
    }
    normalizeCheckDefinition(definition) {
        return definition ? ExpressionBuilder.parse(definition).toString() : "";
    }
    primaryKeyDeclaration(entityMeta) {
        const pkName = "PK_" + entityMeta.name;
        const columnQuery = entityMeta.primaryKeys.select((o) => this.queryBuilder.enclose(o.columnName)).toArray().join(",");
        return `CONSTRAINT ${this.queryBuilder.enclose(pkName)} PRIMARY KEY (${columnQuery})`;
    }
    updateEntitySchema(schema, oldSchema) {
        const oldColumns = oldSchema.columns.where((o) => !!o.columnName).toArray();
        let columnMetas = schema.columns.where((o) => !!o.columnName).select((o) => {
            const oldCol = oldColumns.first((c) => c.columnName.toLowerCase() === o.columnName.toLowerCase());
            oldColumns.delete(oldCol);
            return {
                columnSchema: o,
                oldColumnSchema: oldCol
            };
        });
        columnMetas = columnMetas.union(oldColumns.select((o) => ({
            columnSchema: null,
            oldColumnSchema: o
        })));
        let result = columnMetas.selectMany((o) => {
            if (o.columnSchema && o.oldColumnSchema) {
                return this.getColumnChanges(o.columnSchema, o.oldColumnSchema);
            }
            else if (o.columnSchema) {
                return this.addColumn(o.columnSchema);
            }
            // TODO: add option to always drop column
            else if (o.oldColumnSchema && !o.oldColumnSchema.defaultExp && !o.oldColumnSchema.nullable) {
                return this.dropColumn(o.oldColumnSchema);
            }
            return null;
        });
        // primary key changes
        if (!isColumnsEquals(schema.primaryKeys, oldSchema.primaryKeys)) {
            result = result.union(this.dropPrimaryKey(oldSchema));
            result = result.union(this.addPrimaryKey(schema));
        }
        const isConstraintEquals = (cons1, cons2) => {
            if (cons1 instanceof CheckConstraintMetaData || cons2 instanceof CheckConstraintMetaData) {
                const check1 = cons1;
                const check2 = cons2;
                const checkDef1 = !check1.definition ? undefined : check1.getDefinitionString(this.queryBuilder);
                const checkDef2 = !check2.definition ? undefined : check2.getDefinitionString(this.queryBuilder);
                return this.normalizeCheckDefinition(checkDef1) === this.normalizeCheckDefinition(checkDef2);
            }
            return isColumnsEquals(cons1.columns, cons2.columns);
        };
        // remove old constraint
        result = result.union(oldSchema.constraints.where((o) => !schema.constraints.any((or) => isConstraintEquals(o, or)))
            .selectMany((o) => this.dropConstraint(o)));
        // add new constraint
        result = result.union(schema.constraints.where((o) => !oldSchema.constraints.any((or) => isConstraintEquals(o, or)))
            .selectMany((o) => this.addConstraint(o)));
        // index
        const oldIndices = oldSchema.indices.slice(0);
        let indexMap = schema.indices.select((o) => {
            const oldIndex = oldIndices.first((c) => c.name === o.name);
            oldIndices.delete(oldIndex);
            return ({
                index: o,
                oldIndex: oldIndex
            });
        });
        indexMap = indexMap.union(oldIndices.select((o) => ({
            index: null,
            oldIndex: o
        })));
        const indicesResults = indexMap.selectMany((o) => {
            if (o.index && o.oldIndex) {
                if (!isIndexEquals(o.index, o.oldIndex)) {
                    return this.dropIndex(o.oldIndex).union(this.addIndex(o.index));
                }
            }
            else if (o.index) {
                return this.addIndex(o.index);
            }
            else if (o.oldIndex) {
                return this.dropIndex(o.oldIndex);
            }
            return [];
        });
        result = result.union(indicesResults);
        return result.toArray();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25hbFNjaGVtYUJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUHJvdmlkZXIvUmVsYXRpb25hbC9SZWxhdGlvbmFsU2NoZW1hQnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFJOUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXpDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUMzRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDckYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDOUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUMzRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUM3RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNqRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDdkUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0UsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDN0UsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sbUNB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