import "reflect-metadata";
import { Uuid } from "../../Common/Uuid";
import { IdentifierColumnMetaData } from "../../MetaData/IdentifierColumnMetaData";
import { IIdentityColumnOption } from "../Option/IIdentityColumnOption";
import { Column } from "./Column";

export function IdentifierColumn(option?: IIdentityColumnOption): PropertyDecorator;
export function IdentifierColumn(name: string, defaultValue?: () => Uuid): PropertyDecorator;
export function IdentifierColumn(optionOrName?: string | IIdentityColumnOption, defaultValue?: () => Uuid): PropertyDecorator {
    let option: IIdentityColumnOption = {};
    if (optionOrName && typeof optionOrName !== "string") {
        option = optionOrName;
    }
    else {
        if (typeof optionOrName !== "undefined") {
            option.columnName = optionOrName as string;
        }
        if (typeof defaultValue !== "undefined") {
            option.default = defaultValue;
        }
    }
    return Column<any, Uuid>(IdentifierColumnMetaData, option);
}
