import "reflect-metadata";
import { ObservableArray } from "../../Common/ObservableArray";
import { RelationMetaData } from "../../MetaData/Relation/RelationMetaData";
import { entityMetaKey, relationChangeDispatherMetaKey, relationMetaKey } from "../DecoratorKey";
export function Relationship(name, typeOrDirection, targetTypeOrType, relationKeysOrTargetType, relationKey, options) {
    const relationOption = {
        name
    };
    let targetName;
    let isMaster = true;
    if (typeOrDirection === "by") {
        // slave relation.
        isMaster = false;
        relationOption.relationType = targetTypeOrType;
        if (typeof relationKeysOrTargetType === "string") {
            targetName = relationKeysOrTargetType;
        }
        else {
            relationOption.targetType = relationKeysOrTargetType;
            targetName = relationOption.targetType.name;
        }
        relationOption.relationKeys = relationKey;
        if (options) {
            Object.assign(relationOption, options);
        }
    }
    else {
        // master relation.
        relationOption.relationType = typeOrDirection;
        if (typeof targetTypeOrType === "string") {
            targetName = targetTypeOrType;
        }
        else {
            relationOption.targetType = targetTypeOrType;
            targetName = relationOption.targetType.name;
        }
        relationOption.relationKeys = relationKeysOrTargetType;
    }
    // TODO: FOR SQL TO-ONE relation target must be a unique or primarykeys
    // TODO: Foreignkey for SQL DB
    return (target, propertyKey) => {
        if (!relationOption.sourceType) {
            relationOption.sourceType = target.constructor;
        }
        relationOption.propertyName = propertyKey;
        const sourceMetaData = Reflect.getOwnMetadata(entityMetaKey, relationOption.sourceType);
        const relationMeta = new RelationMetaData(relationOption, isMaster);
        relationMeta.isMaster = isMaster;
        Reflect.defineMetadata(relationMetaKey, relationMeta, relationOption.sourceType, propertyKey);
        const relationName = relationOption.relationKeyName ? relationOption.relationKeyName : relationOption.name + "_" + (isMaster ? relationMeta.source.type.name + "_" + targetName : targetName + "_" + relationMeta.source.type.name);
        relationMeta.fullName = relationName;
        sourceMetaData.relations.push(relationMeta);
        if (relationOption.targetType) {
            const targetMetaData = Reflect.getOwnMetadata(entityMetaKey, relationOption.targetType);
            const reverseRelation = targetMetaData.relations.first((o) => o.fullName === relationName);
            if (reverseRelation) {
                relationMeta.completeRelation(reverseRelation);
            }
        }
        // changes detection here
        const privatePropertySymbol = Symbol(propertyKey);
        let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        let oldGet;
        let oldSet;
        if (descriptor) {
            if (descriptor.get) {
                oldGet = descriptor.get;
            }
            if (descriptor.set) {
                oldSet = descriptor.set;
            }
        }
        descriptor = {
            configurable: true,
            enumerable: true,
            get: function () {
                if (oldGet) {
                    return oldGet.apply(this);
                }
                return this[privatePropertySymbol];
            },
            set: function (value) {
                if (!oldGet && !this.hasOwnProperty(privatePropertySymbol)) {
                    Object.defineProperty(this, privatePropertySymbol, {
                        configurable: true,
                        enumerable: false,
                        value: undefined,
                        writable: true
                    });
                }
                const oldValue = this[propertyKey];
                if (oldValue !== value) {
                    const changeListener = this[relationChangeDispatherMetaKey];
                    if (relationMeta.relationType === "many") {
                        const observed = ObservableArray.observe(value || []);
                        observed.register((type, items) => {
                            if (changeListener) {
                                changeListener({ relation: relationMeta, type, entities: items });
                            }
                        });
                        value = observed;
                    }
                    if (oldSet) {
                        oldSet.apply(this, value);
                    }
                    else {
                        this[privatePropertySymbol] = value;
                    }
                    if (changeListener) {
                        if (relationMeta.relationType === "many") {
                            // NOTE: don't remove current relations,
                            // coz there might be related entity that is not loaded yet.
                            // so removing related entities could not be achived.
                            // To remove current relation, used splice instead
                            if (value && Array.isArray(value) && value.length > 0) {
                                changeListener({ relation: relationMeta, type: "add", entities: value });
                            }
                        }
                        else {
                            // undefined mean current relation is unknown
                            if (oldValue !== null) {
                                changeListener({ relation: relationMeta, type: "del", entities: [oldValue] });
                            }
                            if (value) {
                                changeListener({ relation: relationMeta, type: "add", entities: [value] });
                            }
                        }
                    }
                }
            }
        };
        Object.defineProperty(target, propertyKey, descriptor);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25zaGlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9SZWxhdGlvbi9SZWxhdGlvbnNoaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFNL0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDNUUsT0FBTyxFQUFFLGFBQWEsRUFBRSw4QkFBOEIsRUFBRSxlQUFlLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUtqRyxNQUFNLFVBQVUsWUFBWSxDQUFhLElBQVksRUFBRSxlQUFpRCxFQUFFLGdCQUFxRSxFQUFFLHdCQUE4RSxFQUFFLFdBQXdDLEVBQUUsT0FBbUM7SUFDMVUsTUFBTSxjQUFjLEdBQTBCO1FBQzFDLElBQUk7S0FDQSxDQUFDO0lBQ1QsSUFBSSxVQUFrQixDQUFDO0lBQ3ZCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztJQUNwQixJQUFJLGVBQWUsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUMzQixrQkFBa0I7UUFDbEIsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNqQixjQUFjLENBQUMsWUFBWSxHQUFHLGdCQUF1QixDQUFDO1FBQ3RELElBQUksT0FBTyx3QkFBd0IsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMvQyxVQUFVLEdBQUcsd0JBQXdCLENBQUM7UUFDMUMsQ0FBQzthQUNJLENBQUM7WUFDRixjQUFjLENBQUMsVUFBVSxHQUFHLHdCQUErQixDQUFDO1lBQzVELFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztRQUNoRCxDQUFDO1FBQ0QsY0FBYyxDQUFDLFlBQVksR0FBRyxXQUFrQixDQUFDO1FBQ2pELElBQUksT0FBTyxFQUFFLENBQUM7WUFDVixNQUFNLENB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