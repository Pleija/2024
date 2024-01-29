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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3FsaXRlU2NoZW1hQnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1Byb3ZpZGVyL1NxbGl0ZS9TcWxpdGVTY2hlbWFCdWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUc5QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUMzRixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFTckYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFHaEYsTUFBTSxPQUFPLG1CQUFvQixTQUFRLHVCQUF1QjtJQUFoRTs7UUFDVyxrQkFBYSxHQUFHLElBQUksR0FBRyxDQUEwRDtZQUNwRixDQUFDLFNBQVMsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ3hELENBQUMsU0FBUyxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDeEQsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUNqRCxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDO1lBQ2pELENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDL0MsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUM3QyxDQUFDLGVBQWUsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUN6QyxDQUFDLGtC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