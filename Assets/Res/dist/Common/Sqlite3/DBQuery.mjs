import { Lambda, NodeType, FieldCallExpression } from "./Utils/Lambda.mjs";
export class DBQuery {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJRdWVyeS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9TcWxpdGUzL0RCUXVlcnkubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFDSCxNQUFNLEVBQ04sUUFBUSxFQUlSLG1CQUFtQixFQUV0QixNQUFNLG9CQUFvQixDQUFDO0FBTTVCLE1BQU0sT0FBTyxPQUFPO0lBVWhCLElBQVcsT0FBTyxLQUFLLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFFOUMsWUFBWSxJQUFrQixFQUFFLE9BQWtCO1FBQzlDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQzVCLENBQUM7SUFDTSxLQUFLO1FBQ1IsSUFBSSxHQUFHLEdBQUcsSUFBSSxPQUFPLENBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsSUFBSSxJQUFJLENBQUMsTUFBTTtZQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEQsSUFBSSxJQUFJLENBQUMsU0FBUztZQUFFLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakUsR0FBRyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ2pDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN6QixHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDM0IsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBQ0QsY0FBYztJQUNQLEtBQUssQ0FBQyxJQUF5QixFQUFFLE1BQVc7UUFDL0Ms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