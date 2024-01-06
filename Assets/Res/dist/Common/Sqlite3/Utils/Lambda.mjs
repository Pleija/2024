const binaryChars = [">=", "<=", "==", "===", "!=", "!==", ">", "<"];
const multipleChars = ["&&", "||"];
class Util {
    /** 是否由多个表达式联合组成的 */
    static isMultiple(str) {
        if (str) {
            str = this.filterString(str);
            for (var v of multipleChars) {
                if (str.indexOf(v) >= 0)
                    return true;
            }
        }
        return false;
    }
    /** 是否二元表达式 */
    static isBinary(str) {
        if (str) {
            str = this.filterString(str);
            for (var v of binaryChars) {
                if (str.indexOf(v) >= 0)
                    return true;
            }
        }
        return false;
    }
    /** 是否常量表达式 */
    static isConstant(str) {
        if (str) {
            str = this.filterString(str);
            return str.indexOf(".") < 0;
        }
        return false;
    }
    /** 是否字段调用 */
    static isFieldCall(str, parameters) {
        if (str) {
            str = this.filterString(str);
            if (str.indexOf(".") >= 0 && str.indexOf("(") < 0) {
                for (var param of parameters) {
                    if (str.indexOf(param + ".") >= 0)
                        return true;
                }
            }
        }
        return false;
    }
    /** 是否方法调用 */
    static isMethodCall(str, parameters) {
        if (str) {
            str = this.filterString(str);
            if (str.indexOf(".") >= 0 && str.indexOf("(") > 0) {
                for (var param of parameters) {
                    if (str.indexOf(param + ".") >= 0)
                        return true;
                }
            }
        }
        return false;
    }
    /** 过滤字符串, 排除空格干扰, 排除字符串中字符干扰 */
    static filterString(str) {
        // TODO 未实现方法
        if (str === undefined || str === null || str === void 0)
            return "";
        if (typeof str !== "string")
            return str + "";
        return str;
    }
    /** 查找括号包含的表达式 */
    static findBrackets(str) {
        let start = undefined, end = undefined;
        if (str) {
            let count = undefined;
            for (let i = 0; i < str.length; i++) {
                switch (str[i]) {
                    case "(":
                        start = start ?? i;
                        count = (count ?? 0) + 1;
                        break;
                    case ")":
                        count--;
                        break;
                }
                if (count !== undefined && count == 0) {
                    end = i;
                    break;
                }
            }
        }
        return { start: start ?? -1, end: end ?? -1 };
    }
    /** 移除无效括号 */
    static removeInvaildBrackets(str) {
        if (str) {
            let rep_expr = str.trim();
            while (true) {
                if (rep_expr[0] !== "(")
                    break;
                let count = 1, out = false;
                for (let i = 1; i < rep_expr.length; i++) {
                    let char = rep_expr[i];
                    if (char === "(")
                        count++;
                    else if (char === ")")
                        count--;
                    if (count === 0 && i != rep_expr.length - 1) {
                        out = true;
                        break;
                    }
                }
                if (out)
                    break;
                rep_expr = rep_expr.substring(1, rep_expr.length - 1).trim();
            }
            return rep_expr;
        }
        return str;
    }
    /** 符号转为NodeType */
    static stringToNodeType(str) {
        switch (str) {
            case ">":
                return NodeType.GreaterThan;
            case ">=":
                return NodeType.GreaterThanOrEqual;
            case "<":
                return NodeType.LessThan;
            case "<=":
                return NodeType.LessThanOrEqual;
            case "==":
            case "===":
                return NodeType.Equal;
            case "!=":
            case "!==":
                return NodeType.NotEqual;
            case "&&":
                return NodeType.And;
            case "||":
                return NodeType.Or;
            case "And":
                return NodeType.AndAlso;
            case "Or":
                return NodeType.OrElse;
        }
        return NodeType.Unknown;
    }
    /** NodeType转为符号*/
    static nodeTypeToString(type) {
        switch (type) {
            case NodeType.GreaterThan:
                return ">";
            case NodeType.GreaterThanOrEqual:
                return ">=";
            case NodeType.LessThan:
                return "<";
            case NodeType.LessThanOrEqual:
                return "<=";
            case NodeType.Equal:
                return "==";
            case NodeType.NotEqual:
                return "!=";
            case NodeType.And:
                return "&&";
            case NodeType.Or:
                return "||";
            case NodeType.AndAlso:
                return "And";
            case NodeType.OrElse:
                return "Or";
        }
        for (var v in NodeType) {
            if (v === type.toString())
                return NodeType[v] + "(" + v + ")";
        }
        return type.toString();
    }
    /** 转为Expression对象 */
    static toExpression(expr, parameters, values) {
        if (expr) {
            if (this.isMultiple(expr))
                return new MultipleExpression(expr, parameters, values);
            else if (this.isBinary(expr))
                return new BinaryExpression(expr, parameters, values);
            else if (this.isConstant(expr))
                return new ConstantExpression(expr, parameters, values);
            else if (this.isFieldCall(expr, parameters))
                return new FieldCallExpression(expr, parameters, values);
            else if (this.isMethodCall(expr, parameters))
                return new MethodCallExpression(expr, parameters, values);
            else {
                console.error("Not Supported Expression: " + expr);
                return new Expression(expr, parameters, values);
            }
        }
        return null;
    }
    /** 转换数值 */
    static changeValue(str, values) {
        //从Values中读取数值
        if (values) {
            let v = values[str];
            if (v !== undefined)
                return v;
        }
        let first = str[0];
        if (first === "'" || first === '"' || first === "`")
            return str.substring(1, str.length - 1);
        if (str === "true" || str === "false")
            return str === "true";
        return str;
    }
}
var NodeType;
(function (NodeType) {
    NodeType[NodeType["Unknown"] = 0] = "Unknown";
    /** 多元的(多个表达式联合) */
    NodeType[NodeType["Multiple"] = 1] = "Multiple";
    /** 二元的 */
    NodeType[NodeType["Binary"] = 2] = "Binary";
    /** 常数 */
    NodeType[NodeType["Constant"] = 3] = "Constant";
    /** 字段调用 */
    NodeType[NodeType["Field"] = 4] = "Field";
    /** 方法调用 */
    NodeType[NodeType["MethodCall"] = 5] = "MethodCall";
    /** '>'运算 */
    NodeType[NodeType["GreaterThan"] = 6] = "GreaterThan";
    /** '>='运算 */
    NodeType[NodeType["GreaterThanOrEqual"] = 7] = "GreaterThanOrEqual";
    /** '<'运算 */
    NodeType[NodeType["LessThan"] = 8] = "LessThan";
    /** '<='运算 */
    NodeType[NodeType["LessThanOrEqual"] = 9] = "LessThanOrEqual";
    /** '=='运算 */
    NodeType[NodeType["Equal"] = 10] = "Equal";
    /** '!='运算 */
    NodeType[NodeType["NotEqual"] = 11] = "NotEqual";
    /** '&&'运算 */
    NodeType[NodeType["And"] = 12] = "And";
    /** '||'运算 */
    NodeType[NodeType["Or"] = 13] = "Or";
    /** 'AND'运算 */
    NodeType[NodeType["AndAlso"] = 14] = "AndAlso";
    /** 'OR'运算 */
    NodeType[NodeType["OrElse"] = 15] = "OrElse";
})(NodeType || (NodeType = {}));
/** Lambda表达式解析
 */
class Lambda {
    _func;
    _expr;
    _parameters;
    _values;
    get func() { return this._func; }
    ;
    get expr() { return this._expr; }
    ;
    get parameters() { return this._parameters; }
    ;
    get values() { return this._values; }
    ;
    constructor(func, values) {
        let expr = func.toString();
        this._func = func;
        this._expr = expr;
        this._values = values;
        //解析
        let index = expr.indexOf("=>");
        if (index < 0)
            throw new Error("Not Supported Expression: " + expr);
        this._expr = expr.substring(index + 2).trim();
        this._parameters = new Array();
        expr.substring(0, index)
            .replace("(", "")
            .replace(")", "")
            .split(",")
            .forEach(p_name => {
            p_name = p_name.trim();
            if (p_name && p_name.length > 0)
                this._parameters.push(p_name);
        });
        if (func.length != this._parameters.length)
            console.warn(`Function params length=${func.length},  but actually got ${this._parameters.length} \n${func.name}: ${func.toString()}`);
    }
    get expression() {
        return Util.toExpression(this._expr, this._parameters, this._values);
    }
}
/** 表达式基类 */
class Expression {
    /**表达式字符串 */
    _expr;
    /**参数名称 */
    _parameters;
    /**引用的变量 */
    _values;
    /**表达式类型 */
    _nodeType;
    get nodeType() { return this._nodeType; }
    constructor(expr, parameters, values) {
        this._expr = expr;
        this._parameters = parameters;
        this._values = values;
        this._nodeType = NodeType.Unknown;
    }
    toString() {
        return this._expr + "\nTYPE:" + Util.nodeTypeToString(this._nodeType);
    }
    get isMultiple() {
        return this instanceof MultipleExpression;
    }
    get isBinary() {
        return this instanceof BinaryExpression;
    }
    get isConstant() {
        return this instanceof ConstantExpression;
    }
    get isFieldCall() {
        return this instanceof FieldCallExpression;
    }
    get isMethodCall() {
        return this instanceof MethodCallExpression;
    }
}
/** 多项表达式 */
class MultipleExpression extends Expression {
    _left;
    _right;
    get left() { return Util.toExpression(this._left, this._parameters, this._values); }
    ;
    get right() { return Util.toExpression(this._right, this._parameters, this._values); ; }
    ;
    constructor(expr, parameters, values) {
        super(expr, parameters, values);
        this.working();
    }
    working() {
        this._nodeType = NodeType.Multiple;
        let maps = {}, count = 0;
        let rep_expr = Util.removeInvaildBrackets(this._expr);
        //替换表达式括号包含的内容
        while (true) {
            let { start, end } = Util.findBrackets(rep_expr);
            if (start >= 0 && end >= 0) {
                let rep_name = "[rep_name" + (count++) + "]";
                let rep_content = rep_expr.substring(start, end + 1);
                maps[rep_name] = rep_content;
                rep_expr = rep_expr.replace(rep_content, rep_name);
            }
            else
                break;
        }
        //分割多元表达式
        for (let v of multipleChars) {
            let index = rep_expr.indexOf(v);
            if (index >= 0) {
                this._left = rep_expr.substring(0, index);
                this._right = rep_expr.substring(index + v.length);
                this._nodeType = Util.stringToNodeType(v);
                break;
            }
        }
        //还原表达式括号包含的内容
        Object.keys(maps).forEach(rep_name => {
            let rep_content = maps[rep_name];
            this._left = this._left.replace(rep_name, rep_content);
            this._right = this._right.replace(rep_name, rep_content);
        });
    }
    toString() {
        return this._expr + "\nTYPE:\t" + Util.nodeTypeToString(this._nodeType) + "\nLEFT:\t" + this._left + "\nRIGHT:\t" + this._right;
    }
}
/** 二元表达式 */
class BinaryExpression extends Expression {
    _left;
    _right;
    get left() { return Util.toExpression(this._left, this._parameters, this._values); }
    ;
    get right() { return Util.toExpression(this._right, this._parameters, this._values); }
    ;
    constructor(expr, parameters, values) {
        super(expr, parameters, values);
        this.working();
    }
    /**解析二元表达式 */
    working() {
        this._nodeType = NodeType.Binary;
        let rep_expr = Util.removeInvaildBrackets(this._expr);
        for (let v of binaryChars) {
            let index = rep_expr.indexOf(v);
            if (index >= 0) {
                this._left = rep_expr.substring(0, index).trim();
                this._right = rep_expr.substring(index + v.length).trim();
                this._nodeType = Util.stringToNodeType(v);
                break;
            }
        }
    }
    toString() {
        return this._expr + "\nTYPE:\t" + Util.nodeTypeToString(this._nodeType) + "\nLEFT:\t" + this._left + "\nRIGHT:\t" + this._right;
    }
}
/** 常数表达式 */
class ConstantExpression extends Expression {
    _value;
    get value() { return this._value; }
    ;
    constructor(expr, parameters, values) {
        super(expr, parameters, values);
        this.working();
    }
    /**解析表达式 */
    working() {
        this._nodeType = NodeType.Constant;
        this._value = Util.changeValue(this._expr, this._values);
    }
    toString() {
        return this._expr + "\nTYPE:\t" + Util.nodeTypeToString(this._nodeType) + "\nVALUE:\t" + this._value;
    }
}
/** 字段访问表达式 */
class FieldCallExpression extends Expression {
    _fieldName;
    get fieldName() { return this._fieldName; }
    ;
    constructor(expr, parameters, values) {
        super(expr, parameters, values);
        this.working();
    }
    /**解析表达式 */
    working() {
        this._nodeType = NodeType.Field;
        for (var param of this._parameters) {
            let index = this._expr.indexOf(param + ".");
            if (index >= 0) {
                this._fieldName = this._expr.substring(index + param.length + 1).trim();
                break;
            }
        }
    }
    toString() {
        return this._expr + "\nTYPE:\t" + Util.nodeTypeToString(this._nodeType) + "\nFIELD_NAME:\t" + this._fieldName;
    }
}
/** 方法访问表达式
 * methodName: 方法名称
 * fieldName: 不为undefined时, 则为调用字段方法
 */
class MethodCallExpression extends Expression {
    _fieldName;
    _methodName;
    _methodParameters;
    get fieldName() { return this._fieldName; }
    ;
    get methodName() { return this._methodName; }
    ;
    get methodParameters() { return this._methodParameters; }
    ;
    constructor(expr, parameters, values) {
        super(expr, parameters, values);
        this.working();
    }
    /**解析表达式 */
    working() {
        this._nodeType = NodeType.MethodCall;
        this._methodParameters = new Array();
        for (var param of this._parameters) {
            let index = this._expr.indexOf(param + ".");
            if (index >= 0) {
                let method = this._expr.substring(index + param.length + 1).trim();
                index = method.indexOf(".");
                if (index >= 0) {
                    //调用字段方法
                    this._fieldName = method.substring(0, index);
                    this._methodName = method.substring(index + 1, method.indexOf("("));
                }
                else {
                    //调用对象方法
                    this._methodName = method.substring(0, method.indexOf("("));
                }
                //获取参数
                let parameters = method.substring(method.indexOf("(") + 1, method.indexOf(")"));
                for (var param of parameters.split(",")) {
                    let value = Util.changeValue(param, this._values);
                    let expr = Util.toExpression(value, this._parameters, this._values);
                    this._methodParameters.push(expr);
                }
                break;
            }
        }
    }
    toString() {
        return this._expr + "\nTYPE:\t" + Util.nodeTypeToString(this._nodeType)
            + "\nFIELD_NAME:\t" + this._fieldName
            + "\nMETHOD_NAME:\t" + this._methodName
            + "\nMETHOD_PARAMS:\t" + this._methodParameters;
    }
}
export { Lambda, NodeType, Expression, MultipleExpression, BinaryExpression, ConstantExpression, FieldCallExpression, MethodCallExpression };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGFtYmRhLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvVXRpbHMvTGFtYmRhLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFdBQVcsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNyRSxNQUFNLGFBQWEsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUVuQyxNQUFNLElBQUk7SUFDTixvQkFBb0I7SUFDcEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFXO1FBQ3pCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDTixHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QixLQUFLLElBQUksQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUMxQixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDbkIsT0FBTyxJQUFJLENBQUM7WUFDcEIsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0QsY0FBYztJQUNkLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBVztRQUN2QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ04sR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0IsS0FBSyxJQUFJLENBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDeEIsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ25CLE9BQU8sSUFBSSxDQUFDO1lBQ3BCLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FB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