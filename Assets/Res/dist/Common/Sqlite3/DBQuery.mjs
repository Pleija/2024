import { Lambda, NodeType, FieldCallExpression } from "./Utils/Lambda.mjs";
export class DBQuery {
    _conn;
    _mapping;
    _limit;
    _offset;
    _where;
    _orderBys;
    _betweenBy;
    get mapping() { return this._mapping; }
    constructor(conn, mapping) {
        this._conn = conn;
        this._mapping = mapping;
    }
    clone() {
        let ins = new DBQuery(this._conn, this._mapping);
        if (this._where)
            ins._where = new Array(...this._where);
        if (this._orderBys)
            ins._orderBys = new Array(...this._orderBys);
        ins._betweenBy = this._betweenBy;
        ins._limit = this._limit;
        ins._offset = this._offset;
        return ins;
    }
    //#region 条件方法
    where(expr, values) {
        let lambda = new Lambda(expr, values);
        let q = this.clone();
        q.addWhere(lambda);
        return q;
    }
    orderBy(expr) {
        return this.addOrder(expr, true);
    }
    orderByDescending(expr) {
        return this.addOrder(expr, false);
    }
    between(expr, start, end) {
        if (expr !== undefined && expr !== null && expr !== void 0) {
            let bin = new Lambda(expr).expression;
            if (!(bin instanceof FieldCallExpression))
                throw new Error("NotSupportedException: Order By does not support: " + expr);
            let q = this.clone();
            q._betweenBy = {
                columnName: bin.fieldName,
                start,
                end
            };
            return q;
        }
        throw new Error("NotSupportedException: Must be a predicate");
    }
    take(n) {
        let q = this.clone();
        q._limit = n;
        return q;
    }
    skip(n) {
        let q = this.clone();
        q._offset = n;
        return q;
    }
    addWhere(where) {
        if (!this._where)
            this._where = new Array();
        this._where.push(where);
    }
    addOrder(expr, asc) {
        if (expr !== undefined && expr !== null && expr !== void 0) {
            let bin = new Lambda(expr).expression;
            if (!(bin instanceof FieldCallExpression))
                throw new Error("NotSupportedException: Order By does not support: " + expr);
            let q = this.clone();
            if (!q._orderBys)
                q._orderBys = new Array();
            q._orderBys.push({
                columnName: bin.fieldName,
                ascending: asc
            });
            return q;
        }
        throw new Error("NotSupportedException: Must be a predicate");
    }
    //#endregion
    //#region 增删查改
    query() {
        return this.generateQuery("*").executeQuery(this._mapping);
    }
    delete() {
        return this.generateDelete().executeUpdate();
    }
    update(obj) {
        if (!obj || !this._where)
            return 0;
        return this.generateUpdate(obj).executeUpdate();
    }
    updateOrInsert(obj) {
        if (!obj || !this._where)
            return 0;
        var ret = this.generateUpdate(obj).executeUpdate();
        if (ret > 0)
            return ret;
        return this._conn.insert(obj);
    }
    first() {
        let result = this.take(1).query();
        if (result && result.length > 0)
            return result[0];
        return undefined;
    }
    elemnetAt(index) {
        let result = this.skip(index).take(1).query();
        if (result && result.length > 0)
            return result[0];
        return undefined;
    }
    count(expr) {
        if (expr)
            return this.where(expr).count();
        return this.generateQuery("count(*)").executeScalar("number");
    }
    //#endregion
    //#region 构建DBCommand实例
    generateQuery(cols) {
        let args = new Array();
        let query = "SELECT " + cols + " FROM \"" + this._mapping.tableName + "\" ";
        if (this._where) {
            query += " WHERE " + this.compileExprs(this._where, args);
        }
        if (this._betweenBy) {
            query += " WHERE \"" + this._betweenBy.columnName + "\" BETWEEN ? AND ?";
            args.push(this._betweenBy.start);
            args.push(this._betweenBy.end);
        }
        if (this._orderBys) {
            query += " ORDER BY ";
            for (let i = 0; i < this._orderBys.length; i++) {
                if (i > 0)
                    query += ",";
                query += "\"" + this._orderBys[i].columnName + "\"" + (this._orderBys[i].ascending ? "" : " DESC");
            }
        }
        if (this._limit)
            query += " LIMIT " + this._limit;
        if (this._offset) {
            if (!this._limit)
                query += " LIMIT -1";
            query += " OFFSET " + this._offset;
        }
        return this._conn.createCommand(query, ...args);
    }
    generateUpdate(obj) {
        let args = new Array();
        let query = "UPDATE \"" + this._mapping.tableName + "\" SET ";
        let cols = this._mapping.columns;
        for (let i = 0; i < cols.length; i++) {
            let col = cols[i];
            if (col != this._mapping.pk) {
                if (args.length > 0)
                    query += ",";
                query += "\"" + col.name + "\" = ? ";
                args.push(col.encode(obj[col.prop]));
            }
        }
        if (this._where) {
            query += " WHERE " + this.compileExprs(this._where, args);
        }
        this._conn.markUpdateTable(this._mapping.tableName);
        return this._conn.createCommand(query, ...args);
    }
    generateDelete() {
        let args = new Array();
        let query = "DELETE FROM \"" + this._mapping.tableName + "\"";
        if (this._where) {
            query += " WHERE " + this.compileExprs(this._where, args);
        }
        this._conn.markUpdateTable(this._mapping.tableName);
        return this._conn.createCommand(query, ...args);
    }
    //#endregion
    compileExprs(wheres, out_args) {
        let text = "";
        for (let i = 0; i < wheres.length; i++) {
            if (i > 0)
                text += " AND ";
            let where = this.compileExpr(wheres[i].expression, out_args);
            text += where.commandText;
        }
        return text;
    }
    compileExpr(expr, outArgs) {
        //console.log(expr);
        if (expr.isMultiple || expr.isBinary) {
            let bin = expr;
            let lefer = this.compileExpr(bin.left, outArgs);
            let rightr = this.compileExpr(bin.right, outArgs);
            //If either side is a parameter and is null, then handle the other side specially (for "is null"/"is not null")
            let text;
            if (lefer.commandText === "?" && lefer.value === undefined)
                text = this.compileNullBinaryExpression(bin, rightr);
            else if (rightr.commandText === "?" && rightr.value === undefined)
                text = this.compileNullBinaryExpression(bin, lefer);
            else
                text = "(" + lefer.commandText + " " + this.getSqlName(bin) + " " + rightr.commandText + ")";
            return { commandText: text };
        }
        else if (expr.isConstant) {
            let bin = expr;
            outArgs.push(bin.value);
            return {
                commandText: "?",
                value: bin.value
            };
        }
        else if (expr.isFieldCall) {
            let bin = expr;
            let fieldName = bin.fieldName;
            let column = this._mapping.findColumnByPorpertyName(bin.fieldName);
            if (column) {
                fieldName = column.name;
            }
            return {
                commandText: "\"" + fieldName + "\"",
            };
        }
        else if (expr.isMethodCall) {
            let bin = expr;
            //获取参数表达式
            let args = new Array();
            for (var argExpr of bin.methodParameters)
                args.push(this.compileExpr(argExpr, outArgs));
            let text;
            if (bin.methodName === "contains" && args.length == 1) {
                let { commandText, value } = args[0];
                if (commandText === "?" && value) {
                    commandText = value;
                    if (outArgs.length > 0)
                        outArgs.pop();
                }
                text = "(" + bin.fieldName + " LIKE ( '%' || " + commandText + " || '%' ))";
                //text = "(" + args[0].commandText + " IN " + bin.fieldName + ")";
                //text = "(" + bin.fieldName + " LIKE " + args[0].commandText + " )";
            }
            else if (bin.methodName === "startsWith" && args.length == 1) {
                text = "(" + bin.fieldName + " LIKE (" + args[0].commandText + " || '%' ))";
            }
            else if (bin.methodName === "endsWith" && args.length == 1) {
                text = "(" + bin.fieldName + " LIKE ( '%' || " + args[0].commandText + "))";
            }
            else if (bin.methodName === "link" && args.length == 1) {
                text = "(" + bin.fieldName + " LIKE " + args[1].commandText + ")";
            }
            else if (bin.methodName === "toUpperCase" && args.length == 1) {
                text = "(UPPER(" + bin.fieldName + "))";
            }
            else if (bin.methodName === "toLowerCase" && args.length == 1) {
                text = "(LOWER(" + bin.fieldName + "))";
            }
            else {
                let s = undefined;
                for (let arg of args) {
                    if (s)
                        s += ",";
                    s += arg.commandText;
                }
                text = bin.methodName.toLowerCase() + "(" + s + ")";
            }
            return { commandText: text };
        }
        throw new Error("NotSupportedException: Cannot compile: " + expr);
    }
    compileNullBinaryExpression(expr, param) {
        switch (expr.nodeType) {
            case NodeType.Equal:
                return "(" + param.commandText + " IS ?)";
            case NodeType.NotEqual:
                return "(" + param.commandText + " IS NOT ?)";
            default:
                throw new Error("Cannot compile Null-BinaryExpression with type " + expr.nodeType);
        }
    }
    getSqlName(expr) {
        switch (expr.nodeType) {
            case NodeType.GreaterThan:
                return ">";
            case NodeType.GreaterThanOrEqual:
                return ">=";
            case NodeType.LessThan:
                return "<";
            case NodeType.LessThanOrEqual:
                return "<=";
            case NodeType.And:
                return "&";
            case NodeType.AndAlso:
                return "AND";
            case NodeType.Or:
                return "|";
            case NodeType.OrElse:
                return "OR";
            case NodeType.Equal:
                return "=";
            case NodeType.NotEqual:
                return "!=";
            default:
                throw new Error("Cannot get SQL for: " + expr.nodeType);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJRdWVyeS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzL0RCUXVlcnkubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFDSCxNQUFNLEVBQ04sUUFBUSxFQUlSLG1CQUFtQixFQUV0QixNQUFNLG9CQUFvQixDQUFDO0FBTTVCLE1BQU0sT0FBTyxPQUFPO0lBQ1IsS0FBSyxDQUFlO0lBQ3BCLFFBQVEsQ0FBWTtJQUVwQixNQUFNLENBQVM7SUFDZixPQUFPLENBQVM7SUFDaEIsTUFBTSxDQUFXO0lBQ2pCLFNBQVMsQ0FBYTtJQUN0QixVQUFVLENBQWE7SUFFL0IsSUFBVyxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUU5QyxZQUFZLElBQWtCLEVBQUUsT0FBa0I7UUFDOUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUNNLEtBQUs7UUFDUixJQUFJLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBSSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRCxJQUFJLElBQUksQ0FBQyxNQUFNO1lBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RCxJQUFJLElBQUksQ0FBQyxTQUFTO1lBQUUsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRSxHQUFHLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDakMsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3pCLEdBQUcsQ0FB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