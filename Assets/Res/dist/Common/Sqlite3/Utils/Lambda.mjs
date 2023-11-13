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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGFtYmRhLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvVXRpbHMvTGFtYmRhLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFdBQVcsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNyRSxNQUFNLGFBQWEsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUVuQyxNQUFNLElBQUk7SUFDTixvQkFBb0I7SUFDcEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFXO1FBQ3pCLElBQUksR0FBRyxFQUFFO1lBQ0wsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0IsS0FBSyxJQUFJLENBQUMsSUFBSSxhQUFhLEVBQUU7Z0JBQ3pCLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNuQixPQUFPLElBQUksQ0FBQzthQUNuQjtTQUNKO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNELGNBQWM7SUFDZCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQVc7UUFDdkIsSUFBSSxHQUFHLEVBQUU7WUFDTCxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QixLQUFLLElBQUksQ0FBQyxJQUFJLFdBQVcsRUFBRTtnQkFDdkIsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ25CLE9BQU8sSUFBSSxDQUFDO2FBQ25CO1NBQ0o7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0QsY0FBYztJQUNkLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FB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