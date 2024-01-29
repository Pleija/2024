import { RelationalSchemaBuilder } from "../Relational/RelationalSchemaBuilder";
export class PostgresqlSchemaBuilder extends RelationalSchemaBuilder {
    constructor() {
        super(...arguments);
        this.columnTypeMap = new Map([
            ["smallint", { columnType: "smallint", group: "Integer" }],
            ["int2", { columnType: "int2", group: "Integer" }],
            ["integer", { columnType: "integer", group: "Integer" }],
            ["int", { columnType: "int", group: "Integer" }],
            ["int4", { columnType: "int4", group: "Integer" }],
            ["bigint", { columnType: "bigint", group: "Integer" }],
            ["int8", { columnType: "int8", group: "Integer" }],
            ["numeric", { columnType: "numeric", group: "Decimal", option: { precision: 18, scale: 0 } }],
            ["real", { columnType: "real", group: "Real" }],
            ["float", { columnType: "float", group: "Real", option: { precision: 18 } }],
            ["double precision", { columnType: "double precision", group: "Real" }],
            ["money", { columnType: "money", group: "Decimal" }],
            ["varchar", { columnType: "varchar", group: "String", option: { length: 50 } }],
            ["character varying", { columnType: "character varying", group: "String", option: { length: 50 } }],
            ["char", { columnType: "char", group: "String", option: { length: 10 } }],
            ["character", { columnType: "character", group: "String", option: { length: 10 } }],
            ["text", { columnType: "text", group: "String" }],
            ["bytea", { columnType: "bytea", group: "Binary" }],
            ["bit", { columnType: "bit", group: "Binary", option: { length: 50 } }],
            ["bit varying", { columnType: "bit varying", group: "Binary", option: { length: 50 } }],
            ["timestamp", { columnType: "timestamp", group: "DateTime" }], // option: with time zone
            ["date", { columnType: "date", group: "Date" }],
            ["time", { columnType: "time", group: "Time" }], // option: with time zone
            ["boolean", { columnType: "boolean", group: "Boolean" }],
            ["uuid", { columnType: "uuid", group: "Identifier" }],
            ["xml", { columnType: "xml", group: "Serialize" }],
            ["json", { columnType: "json", group: "Serialize" }],
            ["defaultBoolean", { columnType: "boolean" }],
            ["defaultBinary", { columnType: "bytea" }],
            ["defaultSerialize", { columnType: "json" }],
            ["defaultDate", { columnType: "date" }],
            ["defaultDateTime", { columnType: "timestamp" }],
            ["defaultTime", { columnType: "time" }],
            ["defaultDecimal", { columnType: "numeric" }],
            ["defaultEnum", { columnType: "varchar" }],
            ["defaultIdentifier", { columnType: "uuid" }],
            ["defaultInteger", { columnType: "integer" }],
            ["defaultString", { columnType: "varchar" }],
            ["defaultRowVersion", { columnType: "timestamp" }]
            // Enumerated type (custom types)
            // Geometry
            // ["point", { columnType: "point", group: "Geometry"}],
            // ["line", { columnType: "line", group: "Geometry"}],
            // ["lseg", { columnType: "lseg", group: "Geometry"}],
            // ["box", { columnType: "box", group: "Geometry"}],
            // ["path", { columnType: "path", group: "Geometry"}], // open and close type
            // ["polygon", { columnType: "polygon", group: "Geometry"}],
            // ["circle", { columnType: "circle", group: "Geometry"}],
            // Network Address
            // ["cidr", { columnType: "cidr", group: "Network"}],
            // ["inet", { columnType: "inet", group: "Network"}],
            // ["macaddr", { columnType: "macaddr", group: "Network"}],
            // Text Search
            // ["tsvector", { columnType: "tsvector", group: "Search"}],
            // ["tsquery", { columnType: "tsquery", group: "Search"}],
            // Arrays
            // Composite
            // Range
            // ["int4range", { columnType: "int4range", group: "Range"}],
            // ["int8range", { columnType: "int8range", group: "Range"}],
            // ["numrange", { columnType: "numrange", group: "Range"}],
            // ["tsrange", { columnType: "tsrange", group: "Range"}],
            // ["tstzrange", { columnType: "tstzrange", group: "Range"}],
            // ["daterange", { columnType: "daterange", group: "Range"}],
            // ["interval", { columnType: "interval", group: "Interval"}],
        ]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdGdyZXNxbFNjaGVtYUJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9Qcm92aWRlci9Qb3N0Z3Jlc3FsL1Bvc3RncmVzcWxTY2hlbWFCdWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRWhGLE1BQU0sT0FBTyx1QkFBd0IsU0FBUSx1QkFBdUI7SUFBcEU7O1FBQ1csa0JBQWEsR0FBK0MsSUFBSSxHQUFHLENBQXdDO1lBQzlHLENBQUMsVUFBVSxFQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDMUQsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUNsRCxDQUFDLFNBQVMsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ3hELENBQUMsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDaEQsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUNsRCxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ3RELENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDbEQsQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM3RixDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQy9DLENBQUMsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQzVFLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ3ZFLENBQUMsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDcEQsQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDL0UsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ25HLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ3pFLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ25GLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDakQsQ0FBQyxPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUNuRCxDQUFDLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUN2RSxDQUFDLGFBQWEsRUFBRSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUN2RixDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUseUJBQXlCO1lBQ3hGLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDL0MsQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLHlCQUF5QjtZQUMxRSxDQUFDLFNBQVMsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ3hELENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUM7WUFDckQsQ0FBQyxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztZQUNsRCxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQ3BELENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFDLENBQUM7WUFDNUMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFDLENBQUM7WUFDekMsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUMsQ0FBQztZQUMzQyxDQUFDLGFBQWEsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUMsQ0FBQztZQUN0QyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBQyxDQUFDO1lBQy9DLENBQUMsYUFBYSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBQyxDQUFDO1lBQ3RDLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFDLENBQUM7WUFDNUMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFDLENBQUM7WUFDekMsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUMsQ0FBQztZQUM1QyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBQyxDQUFDO1lBQzVDLENBQUMsZUFBZSxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBQyxDQUFDO1lBQzNDLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFDLENBQUM7WUFFakQsaUNBQWlDO1lBQ2pDLFdBQVc7WUFDWCx3REFBd0Q7WUFDeEQsc0RBQXNEO1lBQ3RELHNEQUFzRDtZQUN0RCxvREFBb0Q7WUFDcEQsNkVBQTZFO1lBQzdFLDREQUE0RDtZQUM1RCwwREFBMEQ7WUFDMUQsa0JBQWtCO1lBQ2xCLHFEQUFxRDtZQUNyRCxxREFBcUQ7WUFDckQsMkRBQTJEO1lBQzNELGNBQWM7WUFDZCw0REFBNEQ7WUFDNUQsMERBQTBEO1lBQzFELFNBQVM7WUFDVCxZQUFZO1lBQ1osUUFBUTtZQUNSLDZEQUE2RDtZQUM3RCw2REFBNkQ7WUFDN0QsMkRBQTJEO1lBQzNELHlEQUF5RDtZQUN6RCw2REFBNkQ7WUFDN0QsNkRBQTZEO1lBQzdELDhEQUE4RDtTQUNqRSxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQUEifQ==