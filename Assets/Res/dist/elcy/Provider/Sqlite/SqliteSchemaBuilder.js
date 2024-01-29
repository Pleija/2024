import { QueryType } from "../../Common/Enum";
import { FunctionExpression } from "../../ExpressionBuilder/Expression/FunctionExpression";
import { ValueExpression } from "../../ExpressionBuilder/Expression/ValueExpression";
import { RelationalSchemaBuilder } from "../Relational/RelationalSchemaBuilder";
export class SqliteSchemaBuilder extends RelationalSchemaBuilder {
    constructor() {
        super(...arguments);
        this.columnTypeMap = new Map([
            ["integer", { columnType: "integer", group: "Integer" }],
            ["numeric", { columnType: "numeric", group: "Decimal" }],
            ["text", { columnType: "text", group: "String" }],
            ["blob", { columnType: "blob", group: "Binary" }],
            ["real", { columnType: "real", group: "Real" }],
            ["defaultBoolean", { columnType: "numeric" }],
            ["defaultBinary", { columnType: "blob" }],
            ["defaultSerialize", { columnType: "text" }],
            ["defaultDate", { columnType: "text" }],
            ["defaultDateTime", { columnType: "text" }],
            ["defaultTime", { columnType: "text" }],
            ["defaultDecimal", { columnType: "numeric" }],
            ["defaultEnum", { columnType: "text" }],
            ["defaultIdentifier", { columnType: "text" }],
            ["defaultInteger", { columnType: "integer" }],
            ["defaultReal", { columnType: "real" }],
            ["defaultString", { columnType: "text" }],
            ["defaultRowVersion", { columnType: "numeric" }]
        ]);
    }
    addForeignKey(relationMeta) {
        return [];
    }
    dropForeignKey(relationMeta) {
        return [];
    }
    dropTable(entityMeta) {
        const result = super.dropTable(entityMeta);
        result.unshift({
            query: "PRAGMA foreign_keys = OFF",
            type: QueryType.DCL
        });
        result.push({
            query: "PRAGMA foreign_keys = ON",
            type: QueryType.DCL
        });
        return result;
    }
    async loadSchemas(entities) {
        const nameReg = /CONSTRAINT "([^"]+)"/i;
        const checkDefReg = /CHECK\s*\((.*)\)/i;
        const tableNames = entities.select((o) => `'${o.name}'`).toArray().join(",");
        const schemaDatas = await this.connection.query({
            query: `SELECT * FROM "sqlite_master" WHERE type='table' AND tbl_name IN (${tableNames})`,
            type: QueryType.DQL
        });
        const tableSchemas = schemaDatas[0];
        // convert all schema to entityMetaData for comparison
        const result = {};
        for (const tableSchema of tableSchemas.rows) {
            const entity = {
                name: tableSchema.tbl_name,
                primaryKeys: [],
                columns: [],
                indices: [],
                constraints: [],
                relations: [],
                type: Object,
                allowInheritance: false,
                inheritance: null
            };
            result[entity.name] = entity;
            const columnSchemas = await this.connection.query({
                query: `PRAGMA TABLE_INFO("${entity.name}")`,
                type: QueryType.DQL
            });
            for (const columnSchema of columnSchemas.first().rows) {
                const defaultExpression = columnSchema.dflt_value;
                const column = {
                    columnName: columnSchema.name,
                    nullable: columnSchema.notnull === 0,
                    columnType: columnSchema.type,
                    isPrimaryColumn: columnSchema.pk > 0
                    // charset: columnSchema["CHARACTER_SET_NAME"],
                    // collation: columnSchema["COLLATION_NAME"]
                };
                if (defaultExpression) {
                    const defaultString = defaultExpression.substring(1, defaultExpression.length - 1);
                    const body = new ValueExpression(undefined, defaultString);
                    const defaultExp = new FunctionExpression(body, []);
                    column.defaultExp = defaultExp;
                }
                column.entity = entity;
                entity.columns.push(column);
                if (column.isPrimaryColumn) {
                    entity.primaryKeys.push(column);
                }
            }
            const indexSchemas = await this.connection.query({
                query: `PRAGMA INDEX_LIST("${entity.name}")`,
                type: QueryType.DQL
            });
            // index
            for (const indexSchema of indexSchemas.first().rows.where((o) => o.origin === "c")) {
                const indexName = indexSchema.name;
                const index = {
                    name: indexName,
                    columns: [],
                    entity: entity,
                    unique: (indexSchema.unique || "").toString() === "1"
                };
                entity.indices.push(index);
                const indexInfos = await this.connection.query({
                    query: `PRAGMA INDEX_INFO("${indexName}")`,
                    type: QueryType.DQL
                });
                index.columns = indexInfos.first().rows.orderBy([(o) => o.seqno])
                    .select((o) => entity.columns.first((c) => c.columnName === o.name))
                    .where((o) => !!o)
                    .toArray();
            }
            // unique constraint
            for (const constaintSchema of indexSchemas.first().rows.where((o) => o.origin === "u")) {
                const constaintName = constaintSchema.name;
                const constraintMeta = {
                    name: constaintName,
                    entity: entity,
                    columns: []
                };
                entity.constraints.push(constraintMeta);
                const indexInfos = await this.connection.query({
                    query: `PRAGMA INDEX_INFO("${constaintName}")`,
                    type: QueryType.DQL
                });
                constraintMeta.columns = indexInfos.first().rows.orderBy([(o) => o.seqno])
                    .select((o) => entity.columns.first((c) => c.columnName === o.name))
                    .where((o) => !!o)
                    .toArray();
            }
            // check constraint
            const sqlLines = tableSchema.sql.replace(/['`\[\]]/g, "\"").split(/\n/ig);
            for (const checkStr of sqlLines.where((o) => o.search(checkDefReg) >= 0)) {
                let name = "";
                let defStr = "";
                const nameRes = nameReg.exec(checkStr);
                if (nameRes) {
                    name = nameRes[1];
                }
                const defRes = checkDefReg.exec(checkStr);
                if (defRes) {
                    defStr = defRes[1];
                }
                const check = {
                    name: name,
                    entity: entity,
                    columns: [],
                    definition: defStr,
                    getDefinitionString: function () {
                        return this.definition;
                    }
                };
                entity.constraints.push(check);
            }
            // check autoincrement
            const autoIncrementCol = sqlLines.select((o) => {
                o = o.trim();
                const index = o.indexOf(" ");
                const columnName = o.substr(0, index).replace(/"/g, "");
                return {
                    columnName,
                    sql: o.substr(index + 1)
                };
            }).first((o) => o.sql.search(/AUTOINCREMENT/i) >= 0);
            if (autoIncrementCol) {
                const column = entity.columns.first((o) => o.columnName === autoIncrementCol.columnName);
                column.autoIncrement = true;
            }
        }
        // foreign keys
        for (const entityName in result) {
            const foreignKeySchemas = await this.connection.query({
                query: `PRAGMA FOREIGN_KEY_LIST("${entityName}")`,
                type: QueryType.DQL
            });
            for (const relationSchema of foreignKeySchemas[0].rows.orderBy([(o) => o.table], [(o) => o.seq]).groupBy((o) => o.table)) {
                const source = result[entityName]; // orderdetail
                const target = result[relationSchema.key]; // order
                const relationName = `${entityName}_${relationSchema.key}`;
                const sourceCols = relationSchema.select((o) => source.columns.first((c) => c.columnName === o.from)).where((o) => !!o).toArray();
                const targetCols = relationSchema.select((o) => target.columns.first((c) => c.columnName === o.to)).where((o) => !!o).toArray();
                const relationType = targetCols.all((o) => target.primaryKeys.contains(o)) ? "one" : "many";
                const updateOption = relationSchema.first().on_update.toUpperCase();
                const deleteOption = relationSchema.first().on_delete.toUpperCase();
                const fkRelation = {
                    source: source,
                    target: target,
                    fullName: relationName,
                    relationColumns: sourceCols,
                    isMaster: false,
                    relationType: relationType,
                    relationMaps: new Map(),
                    updateOption: updateOption,
                    deleteOption: deleteOption
                };
                const reverseFkRelation = {
                    source: target,
                    target: source,
                    fullName: relationName,
                    relationColumns: targetCols,
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
                source.relations.push(fkRelation);
                target.relations.push(reverseFkRelation);
            }
        }
        return Object.keys(result).select((o) => result[o]).toArray();
    }
    renameTable(entityMetaData, newName) {
        const query = `ALTER TABLE ${this.entityName(entityMetaData)} RENAME TO ${this.queryBuilder.enclose(newName)}`;
        return [{
                query,
                type: QueryType.DDL
            }];
    }
    updateEntitySchema(schema, oldSchema) {
        let result = [];
        const isColumnsEquals = (cols1, cols2) => {
            return cols1.length === cols2.length && cols1.all((o) => cols2.any((p) => p.columnName === o.columnName));
        };
        const isIndexEquals = (index1, index2) => {
            return !!index1.unique === !!index2.unique && isColumnsEquals(index1.columns, index1.columns);
        };
        const isConstraintEquals = (cons1, cons2) => {
            const check1 = cons1;
            const check2 = cons2;
            const checkDef1 = !check1.definition ? undefined : check1.getDefinitionString(this.queryBuilder);
            const checkDef2 = !check2.definition ? undefined : check2.getDefinitionString(this.queryBuilder);
            return checkDef1 === checkDef2 && isColumnsEquals(cons1.columns, cons2.columns);
        };
        const isColumnEquals = (col1, col2) => {
            return this.columnDeclaration(col1, "add") !== this.columnDeclaration(col2, "add");
        };
        // check primarykey changes
        let requireRebuildTable = !isColumnsEquals(schema.primaryKeys, oldSchema.primaryKeys);
        // check foreignkey changes
        const relations = schema.relations.slice(0);
        requireRebuildTable = requireRebuildTable || oldSchema.relations.any((o) => !relations.any((or) => isColumnsEquals(o.relationColumns, or.relationColumns)));
        // check index
        const indices = schema.indices.slice(0);
        requireRebuildTable = requireRebuildTable || oldSchema.indices.any((o) => !indices.any((ix) => isIndexEquals(ix, o)));
        // check constraint
        const constraints = schema.constraints.slice(0);
        requireRebuildTable = requireRebuildTable || oldSchema.constraints.any((o) => !constraints.any((c) => isConstraintEquals(c, o)));
        // check column
        requireRebuildTable = requireRebuildTable || oldSchema.columns.length > schema.columns.length || oldSchema.columns.any((o) => !schema.columns.any((c) => isColumnEquals(c, o)));
        if (requireRebuildTable) {
            result.push({
                query: "PRAGMA foreign_keys = OFF",
                type: QueryType.DCL
            });
            const tempName = `temp_${schema.name}`;
            result = result.concat(this.createTable(schema, tempName));
            const columns = schema.columns.where((o) => oldSchema.columns.any((c) => c.columnName === o.columnName)).select((o) => this.queryBuilder.enclose(o.columnName)).toArray().join(",");
            result.push({
                query: `INSERT INTO ${this.queryBuilder.enclose(tempName)} (${columns}) SELECT ${columns} FROM ${this.entityName(oldSchema)}`,
                type: QueryType.DML
            });
            result = result.concat(this.dropTable(oldSchema));
            result = result.concat(this.renameTable(schema, oldSchema.name));
            result.push({
                query: "PRAGMA foreign_keys = ON",
                type: QueryType.DCL
            });
        }
        else {
            // check all new columns to be added
            const newColumns = schema.columns.where((o) => !oldSchema.columns.any((c) => o.columnName === c.columnName));
            result = result.concat(newColumns.selectMany((o) => this.addColumn(o)).toArray());
        }
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsaXRlU2NoZW1hQnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9Qcm92aWRlci9TcWxpdGUvU3FsaXRlU2NoZW1hQnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFHOUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdURBQXVELENBQUM7QUFDM0YsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBU3JGLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBR2hGLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSx1QkFBdUI7SUFBaEU7O1FBQ1csa0JBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBMEQ7WUFDcEYsQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUN4RCxDQUFDLFNBQVMsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ3hELENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDakQsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUNqRCxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQy9DLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDN0MsQ0FBQyxlQUFlLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDekMsQ0FBQyxr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