import { IdentifierColumnType } from "../../Common/ColumnType";
import { Uuid } from "../../Common/Uuid";
import { IColumnOption } from "./IColumnOption";
// tslint:disable-next-line:ban-types
export interface IIdentityColumnOption extends IColumnOption<Uuid> {
    columnType?: IdentifierColumnType;
}
