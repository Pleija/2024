import { IColumnMetaData } from "./Interface/IColumnMetaData";
import { IEntityMetaData } from "./Interface/IEntityMetaData";
import { IIndexMetaData } from "./Interface/IIndexMetaData";

export class IndexMetaData<TE = any> implements IIndexMetaData<TE> {
    constructor(public entity: IEntityMetaData<TE>, public name: string, ...members: Array<IColumnMetaData<TE>>) {
        this.columns = members;
    }
    public columns: Array<IColumnMetaData<TE>> = [];
    public unique = false;
    /**
     * Apply index option
     */
    public apply(indexOption: IIndexMetaData) {
        if (typeof indexOption.name !== "undefined") {
            this.name = indexOption.name;
        }
        if (typeof indexOption.columns !== "undefined") {
            this.columns = indexOption.columns;
        }
        if (typeof indexOption.unique !== "undefined") {
            this.unique = indexOption.unique;
        }
    }
}
