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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlTcWxTY2hlbWFCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L1Byb3ZpZGVyL015c3FsL015U3FsU2NoZW1hQnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUdoRixNQUFNLE9BQU8sa0JBQW1CLFNBQVEsdUJBQXVCO0lBQS9EOztRQUNXLGtCQUFhLEdBQUcsSUFBSSxHQUFHLENBQXlEO1lBQ25GLENBQUMsU0FBUyxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDeEQsQ0FBQyxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUNoRCxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQzFELENBQUMsU0FBUyxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDeEQsQ0FBQyxXQUFXLEVBQUUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUM1RCxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ3RELENBQUMsU0FBUyxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDN0YsQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM3RixDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDN0QsQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNuRCxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDM0QsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNuRixDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQy9DLENBQUMsVUFBVSxFQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUM7WUFDM0QsQ0FBQyxXQUFXLEVBQUUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQztZQUM3RCxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQy9DLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ3pFLENBQUMsU0FBUyxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQy9FLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDakQsQ0FBQyxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUMvQyxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUMzRSxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNuRixDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDO1lBQ2pELENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDL0MsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztZQUNwRCxDQUFDLGdCQUFnQixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQ3pDLENBQUMsZUFBZSxFQUFFLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQzlDLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDNUMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDdkMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQztZQUMvQyxDQUFDLGFBQWEsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUN2QyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQzdDLENBQUMsYUFBYSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ3ZDLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ3JFLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDekMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDNUMsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsQ0FBQztZQUVsRCxxREFBcUQ7WUFDckQsK0NBQStDO1lBQy9DLDZEQUE2RDtZQUM3RCx1REFBdUQ7WUFDdkQsaUVBQWlFO1lBQ2pFLDJEQUEyRDtZQUMzRCwyRUFBMkU7WUFDM0UscUZBQXFGO1lBQ3JGLCtFQUErRTtZQUMvRSwyRkFBMkY7U0FDOUYsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUFBIn0=