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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JtLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvT3JtLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLE9BQU8sR0FBRztJQUNMLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBYTtRQUMvQixJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7UUFFNUQsSUFBSSxHQUFHLENBQUMsRUFBRTtZQUFFLElBQUksSUFBSSxjQUFjLENBQUM7UUFDbkMsSUFBSSxHQUFHLENBQUMsT0FBTztZQUFFLElBQUksSUFBSSxnQkFBZ0IsQ0FBQztRQUMxQyxJQUFJLEdBQUcsQ0FBQyxNQUFNO1lBQUUsSUFBSSxJQUFJLFNBQVMsQ0FBQztRQUNsQyxJQUFJLEdBQUcsQ0FBQyxPQUFPO1lBQUUsSUFBSSxJQUFJLFdBQVcsQ0FBQztRQUNyQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZDLElBQUksTUFBTSxLQUFLLFdBQVcsSUFBSSxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sS0FBSyxVQUFVO1lBQ3RFLElBQUksSUFBSSxZQUFZLEdBQUcsR0FBRyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDcEQsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBYTtRQUMvQixRQUFRLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQixLQUFLLFFBQVEsQ0FBQztZQUNkLEtBQUssVUFBVSxDQUFDO1lBQ2hCLEtBQUssVUFBVTtnQkFDWCxJQUFJLEdBQUcsQ0FBQyxTQUFTLEtBQUssU0FBUztvQkFDM0IsT0FBTyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7Z0JBQzVDLE9BQU8sU0FBUyxDQUFDO1lBQ3JCLEtBQUssUUFBUTtnQkFDVCxJQUFJLEdBQUcsQ0FBQyxFQUFFO29CQUNOLE9BQU8sU0FBUyxDQUFDO2dCQUNyQixPQUFPLE1BQU0sQ0FBQztZQUNsQixLQUFLLFNBQVM7Z0JBQ1YsT0FBTyxTQUFTLENBQUM7WUFDckIsS0FBSyxRQUFRO2dCQUNULE9BQU8sUUFBUSxDQUFDO1lBQ3BCLEtBQUssU0FBUztnQkFDVixPQUFPLFNBQVMsQ0FBQztZQUNyQixnQkFBZ0I7WUFDaEIsS0FBSyxRQUFRO2dCQUNULE9BQU8sU0FBUyxDQUFDO1lBQ3JCO2dCQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==