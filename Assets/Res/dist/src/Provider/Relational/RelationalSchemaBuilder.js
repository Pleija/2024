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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25hbFNjaGVtYUJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9Qcm92aWRlci9SZWxhdGlvbmFsL1JlbGF0aW9uYWxTY2hlbWFCdWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUk5QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFekMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDM0UsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQzNGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUNyRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUM5RSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUN2RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUMvRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUM3RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxtQ0FB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