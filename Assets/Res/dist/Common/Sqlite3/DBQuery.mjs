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