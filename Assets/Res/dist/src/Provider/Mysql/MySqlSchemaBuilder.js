import { RelationalSchemaBuilder } from "../Relational/RelationalSchemaBuilder";
export class MysqlSchemaBuilder extends RelationalSchemaBuilder {
    constructor() {
        super(...arguments);
        this.columnTypeMap = new Map([
            ["integer", { columnType: "integer", group: "Integer" }],
            ["int", { columnType: "int", group: "Integer" }],
            ["smallint", { columnType: "smallint", group: "Integer" }],
            ["tinyint", { columnType: "tinyint", group: "Integer" }],
            ["mediumint", { columnType: "mediumint", group: "Integer" }],
            ["bigint", { columnType: "bigint", group: "Integer" }],
            ["decimal", { columnType: "decimal", group: "Decimal", option: { precision: 18, scale: 0 } }],
            ["numeric", { columnType: "numeric", group: "Decimal", option: { precision: 18, scale: 0 } }],
            ["float", { columnType: "float", group: "Real", option: {} }],
            ["double", { columnType: "double", group: "Real" }],
            ["real", { columnType: "real", group: "Real", option: {} }],
            ["double precision", { columnType: "double precision", group: "Real", option: {} }],
            ["date", { columnType: "date", group: "Date" }],
            ["datetime", { columnType: "datetime", group: "DateTime" }],
            ["timestamp", { columnType: "timestamp", group: "DateTime" }],
            ["time", { columnType: "time", group: "Time" }],
            ["char", { columnType: "char", group: "String", option: { length: 10 } }],
            ["varchar", { columnType: "varchar", group: "String", option: { length: 50 } }],
            ["text", { columnType: "text", group: "String" }],
            ["bit", { columnType: "bit", group: "Binary" }],
            ["binary", { columnType: "binary", group: "Binary", option: { size: 10 } }],
            ["varbinary", { columnType: "varbinary", group: "Binary", option: { length: 50 } }],
            ["blob", { columnType: "blob", group: "Binary" }],
            ["enum", { columnType: "enum", group: "Enum" }],
            ["json", { columnType: "json", group: "Serialize" }],
            ["defaultBoolean", { columnType: "bit" }],
            ["defaultBinary", { columnType: "varbinary" }],
            ["defaultSerialize", { columnType: "json" }],
            ["defaultDate", { columnType: "date" }],
            ["defaultDateTime", { columnType: "datetime" }],
            ["defaultTime", { columnType: "time" }],
            ["defaultDecimal", { columnType: "decimal" }],
            ["defaultEnum", { columnType: "enum" }],
            ["defaultIdentifier", { columnType: "binary", option: { size: 16 } }],
            ["defaultInteger", { columnType: "int" }],
            ["defaultString", { columnType: "varchar" }],
            ["defaultRowVersion", { columnType: "timestamp" }]
            // ["year", { columnType: "year", group: "Interval"}]
            // ["set", { columnType: "set", group: "Set"}],
            // ["geometry", { columnType: "geometry", group: "Spacial"}],
            // ["point", { columnType: "point", group: "Spacial"}],
            // ["linestring", { columnType: "linestring", group: "Spacial"}],
            // ["polygon", { columnType: "polygon", group: "Spacial"}],
            // ["multipoint", { columnType: "multipoint", group: "SpacialCollection"}],
            // ["multilinestring", { columnType: "multilinestring", group: "SpacialCollection"}],
            // ["multipolygon", { columnType: "multipolygon", group: "SpacialCollection"}],
            // ["geometrycollection", { columnType: "geometrycollection", group: "SpacialCollection"}],
        ]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlTcWxTY2hlbWFCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvUHJvdmlkZXIvTXlzcWwvTXlTcWxTY2hlbWFCdWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBR2hGLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSx1QkFBdUI7SUFBL0Q7O1FBQ1csa0JBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBeUQ7WUFDbkYsQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUN4RCxDQUFDLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ2hELENBQUMsVUFBVSxFQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDMUQsQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUN4RCxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQzVELENBQUMsUUFBUSxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDdEQsQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM3RixDQUFDLFNBQVMsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzdGLENBQUMsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUM3RCxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ25ELENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUMzRCxDQUFDLGtCQUFrQixFQUFFLEVBQUUsVUFBVSxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ25GLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDL0MsQ0FBQyxVQUFVLEVBQUUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQztZQUMzRCxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxDQUFDO1lBQzdELENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDL0MsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDekUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDL0UsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUNqRCxDQUFDLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDO1lBQy9DLENBQUMsUUFBUSxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQzNFLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ25GLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDakQsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUMvQyxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQ3BELENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDekMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLENBQUM7WUFDOUMsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUM1QyxDQUFDLGFBQWEsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUN2QyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxDQUFDO1lBQy9DLENBQUMsYUFBYSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ3ZDLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDN0MsQ0FBQyxhQUFhLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDdkMsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDckUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUN6QyxDQUFDLGVBQWUsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUM1QyxDQUFDLG1CQUFtQixFQUFFLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBRWxELHFEQUFxRDtZQUNyRCwrQ0FBK0M7WUFDL0MsNkRBQTZEO1lBQzdELHVEQUF1RDtZQUN2RCxpRUFBaUU7WUFDakUsMkRBQTJEO1lBQzNELDJFQUEyRTtZQUMzRSxxRkFBcUY7WUFDckYsK0VBQStFO1lBQy9FLDJGQUEyRjtTQUM5RixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQUEifQ==