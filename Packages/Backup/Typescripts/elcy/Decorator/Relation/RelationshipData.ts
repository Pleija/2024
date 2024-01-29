import "reflect-metadata";
import { IObjectType, PropertySelector } from "../../Common/Type";
import { FunctionHelper } from "../../Helper/FunctionHelper";
import { EntityMetaData } from "../../MetaData/EntityMetaData";
import { IEntityMetaData } from "../../MetaData/Interface/IEntityMetaData";
import { RelationDataMetaData } from "../../MetaData/Relation/RelationDataMetaData";
import { entityMetaKey } from "../DecoratorKey";
import { IRelationDataOption } from "../Option/IRelationDataOption";
import { IAdditionalRelationOption } from "../Option/IRelationOption";
export function RelationshipData<M, S = any, T = any>(options: IRelationDataOption<M, S, T>): ClassDecorator;
export function RelationshipData<M, S = any, T = any>(sourceType: IObjectType<S> | string, relationName: string, targetType: IObjectType<T> | string, sourceRelationKeys?: Array<PropertySelector<M>>, targetRelationKeys?: Array<PropertySelector<M>>, name?: string, options?: IAdditionalRelationOption): ClassDecorator;
export function RelationshipData<M, S = any, T = any>(optionsOrSourceType: IRelationDataOption<M, S, T> | IObjectType<S> | string, relationName?: string, targetType?: IObjectType<T> | string, sourceRelationKeys?: Array<PropertySelector<M>>, targetRelationKeys?: Array<PropertySelector<M>>, name?: string, options?: IAdditionalRelationOption): ClassDecorator {
    let relationOption: IRelationDataOption<M, S, T>;
    let sourceName: string;
    let targetName: string;
    if (typeof optionsOrSourceType === "object") {
        relationOption = optionsOrSourceType;
        sourceName = relationOption.sourceType.name;
        targetName = relationOption.targetType.name;
    }
    else {
        relationOption = {
            relationName: relationName,
            name,
            sourceRelationKeys: sourceRelationKeys.select((o) => o instanceof Function ? FunctionHelper.propertyName(o) : o).toArray(),
            targetRelationKeys: targetRelationKeys.select((o) => o instanceof Function ? FunctionHelper.propertyName(o) : o).toArray()
        };
        if (typeof optionsOrSourceType !== "string") {
            relationOption.sourceType = optionsOrSourceType;
            sourceName = optionsOrSourceType.name;
        }
        else {
            sourceName = optionsOrSourceType;
        }
        if (typeof targetType !== "string") {
            relationOption.targetType = targetType;
            targetName = targetType.name;
        }
        else {
            targetName = targetType;
        }

        if (options) {
            Object.assign(relationOption, options);
        }
    }
    return (target: IObjectType<M>) => {
        relationOption.type = target;
        if (!relationOption.name) {
            relationOption.name = target.name;
        }

        relationOption.relationName += "_" + sourceName + "_" + targetName;

        const relationDataMeta = new RelationDataMetaData<M, S, T>(relationOption);
        const entityMet: IEntityMetaData<M, any> = Reflect.getOwnMetadata(entityMetaKey, relationOption.type);
        if (entityMet) {
            relationDataMeta.ApplyOption(entityMet);
        }

        const sourceMetaData: EntityMetaData<S> = Reflect.getOwnMetadata(entityMetaKey, relationOption.sourceType);
        const sourceRelationMeta = sourceMetaData.relations.first((o) => o.fullName === relationDataMeta.relationName);

        const targetMetaData: EntityMetaData<T> = Reflect.getOwnMetadata(entityMetaKey, relationOption.targetType);
        const targetRelationMeta = targetMetaData.relations.first((o) => o.fullName === relationDataMeta.relationName);

        relationDataMeta.completeRelation(sourceRelationMeta, targetRelationMeta);
        Reflect.defineMetadata(entityMetaKey, relationDataMeta, target);
    };
}
