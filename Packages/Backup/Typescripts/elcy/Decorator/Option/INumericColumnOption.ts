import { IntColumnType } from "../../Common/ColumnType";
import { IColumnOption } from "./IColumnOption";
export interface INumericColumnOption extends IColumnOption<number> {
    autoIncrement?: boolean;
    columnType?: IntColumnType;
    length?: number;
}
