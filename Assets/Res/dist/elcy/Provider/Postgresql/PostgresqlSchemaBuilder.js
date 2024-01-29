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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdGdyZXNxbFNjaGVtYUJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvUHJvdmlkZXIvUG9zdGdyZXNxbC9Qb3N0Z3Jlc3FsU2NoZW1hQnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUVoRixNQUFNLE9BQU8sdUJBQXdCLFNBQVEsdUJBQXVCO0lBQXBFOztRQUNXLGtCQUFhLEdBQStDLElBQUksR0FBRyxDQUF3QztZQUM5RyxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQzFELENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDbEQsQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUN4RCxDQUFDLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ2hELENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDbEQsQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQztZQUN0RCxDQUFDLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ2xELENBQUMsU0FBUyxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxF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