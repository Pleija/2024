import "reflect-metadata";
import { isEqual } from "../../Helper/Util";
import { BooleanColumnMetaData } from "../../MetaData/BooleanColumnMetaData";
import { DateTimeColumnMetaData } from "../../MetaData/DateTimeColumnMetaData";
import { IntegerColumnMetaData } from "../../MetaData/IntegerColumnMetaData";
import { RowVersionColumnMetaData } from "../../MetaData/RowVersionColumnMetaData";
import { columnMetaKey, entityMetaKey, propertyChangeDispatherMetaKey } from "../DecoratorKey";
import { AbstractEntity } from "../Entity/AbstractEntity";
export function Column(columnMetaType, columnOption) {
    return (target, propertyKey) => {
        let entityMetaData = Reflect.getOwnMetadata(entityMetaKey, target.constructor);
        if (!entityMetaData) {
            AbstractEntity()(target.constructor);
            entityMetaData = Reflect.getOwnMetadata(entityMetaKey, target.constructor);
        }
        const metadata = new columnMetaType();
        metadata.isProjected = true;
        metadata.applyOption(columnOption);
        if (!metadata.columnName) {
            metadata.columnName = propertyKey;
        }
        metadata.propertyName = propertyKey;
        const existingMetaData = Reflect.getOwnMetadata(columnMetaKey, target.constructor, propertyKey);
        if (existingMetaData != null) {
            metadata.applyOption(existingMetaData);
            entityMetaData.columns.delete(existingMetaData);
        }
        Reflect.defineMetadata(columnMetaKey, metadata, target.constructor, propertyKey);
        entityMetaData.columns.push(metadata);
        const pk = entityMetaData.primaryKeys.first((o) => o.propertyName === metadata.propertyName);
        if (pk) {
            entityMetaData.primaryKeys.delete(pk);
            entityMetaData.primaryKeys.push(metadata);
        }
        if (metadata instanceof DateTimeColumnMetaData) {
            if (columnOption.isCreatedDate) {
                entityMetaData.createDateColumn = metadata;
            }
            else if (columnOption.isModifiedDate) {
                entityMetaData.modifiedDateColumn = metadata;
            }
        }
        else if (metadata instanceof BooleanColumnMetaData) {
            if (columnOption.isDeleteColumn) {
                entityMetaData.deletedColumn = metadata;
            }
        }
        else if (metadata instanceof RowVersionColumnMetaData) {
            entityMetaData.versionColumn = metadata;
            if (!entityMetaData.concurrencyMode) {
                entityMetaData.concurrencyMode = "OPTIMISTIC VERSION";
            }
        }
        else if (metadata instanceof IntegerColumnMetaData) {
            if (metadata.autoIncrement && metadata.defaultExp) {
                console.warn("Auto increment cannot has default value");
            }
        }
        // add property to use setter getter.
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
            set: function (value) {
                if (!oldGet && !this.hasOwnProperty(privatePropertySymbol)) {
                    Object.defineProperty(this, privatePropertySymbol, {
                        value: undefined,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    });
                }
                const oldValue = this[propertyKey];
                // tslint:disable-next-line:triple-equals
                if (!isEqual(oldValue, value)) {
                    if (oldSet) {
                        oldSet.apply(this, value);
                    }
                    else {
                        this[privatePropertySymbol] = value;
                    }
                    const propertyChangeDispatcher = this[propertyChangeDispatherMetaKey];
                    if (propertyChangeDispatcher) {
                        propertyChangeDispatcher({
                            column: metadata,
                            oldValue,
                            newValue: value
                        });
                    }
                }
            },
            get: function () {
                if (oldGet) {
                    return oldGet.apply(this);
                }
                return this[privatePropertySymbol];
            },
            configurable: true,
            enumerable: true
        };
        Object.defineProperty(target, propertyKey, descriptor);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9lbGN5L0RlY29yYXRvci9Db2x1bW4vQ29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sa0JBQWtCLENBQUM7QUFHMUIsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRTdFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRzdFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ25GLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLDhCQUE4QixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0YsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSzFELE1BQU0sVUFBVSxNQUFNLENBQW9CLGNBQWtELEVBQUUsWUFBMkI7SUFDckgsT0FBTyxDQUFDLE1BQVUsRUFBRSxXQUFxQixFQUFFLEVBQUU7UUFDekMsSUFBSSxjQUFjLEdBQXlCLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbEIsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQWdDLENBQUMsQ0FBQztZQUMxRCxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ3RDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsSUFB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