export class Orm {
    static sqlDecl(col) {
        let decl = "\"" + col.name + "\" " + Orm.sqlType(col) + " ";
        if (col.pk)
            decl += "PRIMARY KEY ";
        if (col.autoInc)
            decl += "AUTOINCREMENT ";
        if (col.unique)
            decl += "UNIQUE ";
        if (col.notNull)
            decl += "NOT NULL ";
        let v_type = typeof (col.defaultValue);
        if (v_type !== "undefined" && v_type !== "object" && v_type !== "function")
            decl += "DEFAULT \"" + col.defaultValue + "\" ";
        return decl.trim();
    }
    static sqlType(col) {
        switch (col.propType) {
            case "string":
            case "number[]":
            case "string[]":
                if (col.maxLength !== undefined)
                    return "VARCHAR(" + col.maxLength + ")";
                return "VARCHAR";
            case "number":
                if (col.pk)
                    return "INTEGER";
                return "REAL";
            case "integer":
                return "INTEGER";
            case "bigint":
                return "BIGINT";
            case "boolean":
                return "INTEGER";
            //扩展对Object类型的支持
            case "object":
                return "VARCHAR";
            default:
                throw new Error("NotSupportedException: " + col.propType);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JtLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3FsaXRlMy9Pcm0ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE1BQU0sT0FBTyxHQUFHO0lBQ0wsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFhO1FBQy9CLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUU1RCxJQUFJLEdBQUcsQ0FBQyxFQUFFO1lBQUUsSUFBSSxJQUFJLGNBQWMsQ0FBQztRQUNuQyxJQUFJLEdBQUcsQ0FBQyxPQUFPO1lBQUUsSUFBSSxJQUFJLGdCQUFnQixDQUFDO1FBQzFDLElBQUksR0FBRyxDQUFDLE1BQU07WUFBRSxJQUFJLElBQUksU0FBUyxDQUFDO1FBQ2xDLElBQUksR0FBRyxDQUFDLE9BQU87WUFBRSxJQUFJLElBQUksV0FBVyxDQUFDO1FBQ3JDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkMsSUFBSSxNQUFNLEtBQUssV0FBVyxJQUFJLE1BQU0sS0FBSyxRQUFRLElBQUksTUFBTSxLQUFLLFVBQVU7WUFDdEUsSUFBSSxJQUFJLFlBQVksR0FBRyxHQUFHLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUNwRCxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBQ00sTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFhO1FBQy9CLFFBQVEsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25CLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxVQUFVLENBQUM7WUFDaEIsS0FBSyxVQUFVO2dCQUNYLElBQUksR0FBRyxDQUFDLFNBQVMsS0FBSyxTQUFTO29CQUMzQixPQUFPLFVBQVUsR0FBRyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztnQkFDNUMsT0FBTyxTQUFTLENBQUM7WUFDckIsS0FBSyxRQUFRO2dCQUNULElBQUksR0FBRyxDQUFDLEVBQUU7b0JBQ04sT0FBTyxTQUFTLENBQUM7Z0JBQ3JCLE9BQU8sTUFBTSxDQUFDO1lBQ2xCLEtBQUssU0FBUztnQkFDVixPQUFPLFNBQVMsQ0FBQztZQUNyQixLQUFLLFFBQVE7Z0JBQ1QsT0FBTyxRQUFRLENBQUM7WUFDcEIsS0FBSyxTQUFTO2dCQUNWLE9BQU8sU0FBUyxDQUFDO1lBQ3JCLGdCQUFnQjtZQUNoQixLQUFLLFFBQVE7Z0JBQ1QsT0FBTyxTQUFTLENBQUM7WUFDckI7Z0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEUsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9