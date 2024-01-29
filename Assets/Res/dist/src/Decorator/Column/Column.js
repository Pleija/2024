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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vUGFja2FnZXMvVHNQcm9qL3NyYy9zcmMvRGVjb3JhdG9yL0NvbHVtbi9Db2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxrQkFBa0IsQ0FBQztBQUcxQixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDNUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFN0UsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0UsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFHN0UsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDbkYsT0FBTyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsOEJBQThCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFLMUQsTUFBTSxVQUFVLE1BQU0sQ0FBb0IsY0FBa0QsRUFBRSxZQUEyQjtJQUNySCxPQUFPLENBQUMsTUFBVSxFQUFFLFdBQXFCLEVBQUUsRUFBRTtRQUN6QyxJQUFJLGNBQWMsR0FBeUIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNsQixjQUFjLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBZ0MsQ0FBQyxDQUFDO1lBQzFELGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUVELE1BQU0sUUFBUSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDdEMsUUFBUSxDQUFDLFdBQVcsR0FBRyxJQUFJ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