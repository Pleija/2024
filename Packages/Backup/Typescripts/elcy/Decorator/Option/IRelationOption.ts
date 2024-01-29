import { ReferenceOption, RelationshipType } from "../../Common/StringType";
import { IObjectType } from "../../Common/Type";

export interface IRelationOption<TSource, TTarget> extends IAdditionalRelationOption {
    name?: string;
    propertyName?: keyof TSource;
    // used for sql foreign key constraint name
    relationKeyName?: string;
    relationKeys?: Array<keyof TSource | ((source: TSource) => any)>;
    relationType: RelationshipType | "one?";
    sourceType?: IObjectType<TSource>;
    targetType: IObjectType<TTarget>;
}
export interface IAdditionalRelationOption {
    nullable?: boolean;
    deleteOption?: ReferenceOption;
    updateOption?: ReferenceOption;
}
