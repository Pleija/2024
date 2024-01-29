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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJRdWVyeS5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL1NxbGl0ZTMvREJRdWVyeS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUNILE1BQU0sRUFDTixRQUFRLEVBSVIsbUJBQW1CLEVBRXRCLE1BQU0sb0JBQW9CLENBQUM7QUFNNUIsTUFBTSxPQUFPLE9BQU87SUFDUixLQUFLLENBQWU7SUFDcEIsUUFBUSxDQUFZO0lBRXBCLE1BQU0sQ0FBUztJQUNmLE9BQU8sQ0FBUztJQUNoQixNQUFNLENBQVc7SUFDakIsU0FBUyxDQUFhO0lBQ3RCLFVBQVUsQ0FBYTtJQUUvQixJQUFXLE9BQU8sS0FBSyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBRTlDLFlBQVksSUFBa0IsRUFBRSxPQUFrQjtRQUM5QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztJQUM1QixDQUFDO0lBQ00sS0FBSztRQUNSLElBQUksR0FBRyxHQUFHLElBQUksT0FBTyxDQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELElBQUksSUFBSSxDQUFDLE1BQU07WUFBRSxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hELElBQUksSUFBSSxDQUFDLFNBQVM7WUFBRSxHQUFHLENBQUMsU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLEdBQUcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNqQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDekIsR0FBRyxDQUFDLE9BQU8sR0FB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