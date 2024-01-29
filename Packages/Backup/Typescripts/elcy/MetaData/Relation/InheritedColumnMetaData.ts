import { ColumnType } from "../../Common/ColumnType";
import { GenericType } from "../../Common/Type";
import { IColumnOption } from "../../Decorator/Option/IColumnOption";
import { FunctionExpression } from "../../ExpressionBuilder/Expression/FunctionExpression";
import { ColumnMetaData } from "../ColumnMetaData";
import { IColumnMetaData } from "../Interface/IColumnMetaData";
import { IEntityMetaData } from "../Interface/IEntityMetaData";

export class InheritedColumnMetaData<TE extends TP = any, TP = any, T = any> implements IColumnMetaData<TE, T> {
    public get columnName(): string {
        return this.parentColumnMetaData.columnName;
    }
    public get propertyName() {
        return this.parentColumnMetaData.propertyName;
    }
    public get nullable(): boolean {
        return this.parentColumnMetaData.nullable;
    }
    public get defaultExp(): FunctionExpression<T> {
        return this.parentColumnMetaData.defaultExp;
    }
    public get description(): string {
        return this.parentColumnMetaData.description;
    }
    public get columnType(): ColumnType {
        return this.parentColumnMetaData.columnType;
    }
    public get type(): GenericType<T> {
        return this.parentColumnMetaData.type;
    }
    public get collation(): string {
        return this.parentColumnMetaData.collation;
    }
    public get charset(): string {
        return this.parentColumnMetaData.charset;
    }
    public get parentEntity(): IEntityMetaData<TP> {
        return this.parentColumnMetaData.entity;
    }
    constructor(public entity: IEntityMetaData<TE>, public parentColumnMetaData: IColumnMetaData<TP, T>) {
        if (parentColumnMetaData instanceof InheritedColumnMetaData) {
            this.parentColumnMetaData = parentColumnMetaData.parentColumnMetaData;
        }
        else if (parentColumnMetaData instanceof ColumnMetaData) {
            this.parentColumnMetaData = parentColumnMetaData;
        }
    }

    /**
     * Copy
     */
    public applyOption(columnMeta: IColumnOption<TE>) {
        if (columnMeta instanceof InheritedColumnMetaData) {
            this.parentColumnMetaData = columnMeta.parentColumnMetaData;
        }
        else if (columnMeta instanceof ColumnMetaData) {
            this.parentColumnMetaData = columnMeta as ColumnMetaData<TP>;
        }
    }
}
