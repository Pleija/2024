/* istanbul ignore file */
// TODO: Re-enabled once embedded entity fully supported
import { propertyChangeDispatherMetaKey, propertyChangeHandlerMetaKey } from "../Decorator/DecoratorKey";
import { EventHandlerFactory } from "../Event/EventHandlerFactory";
import { EntityEntry } from "./EntityEntry";
import { EntityState } from "./EntityState";
export class EmbeddedEntityEntry extends EntityEntry {
    get state() {
        return super.state;
    }
    set state(value) {
        if (super.state !== value) {
            const dbContext = this.dbSet.dbContext;
            const isModified = (this.state === EntityState.Detached || this.state === EntityState.Unchanged) && !(value === EntityState.Detached || value === EntityState.Unchanged);
            const isUnchanged = !(this.state === EntityState.Detached || this.state === EntityState.Unchanged) && (value === EntityState.Detached || value === EntityState.Unchanged);
            if (isUnchanged) {
                const embeddedEntries = dbContext.modifiedEmbeddedEntries.get(this.metaData);
                if (embeddedEntries) {
                    embeddedEntries.delete(this);
                }
            }
            else if (isModified) {
                let typedEntries = dbContext.modifiedEmbeddedEntries.get(this.metaData);
                if (!typedEntries) {
                    typedEntries = [];
                    dbContext.modifiedEmbeddedEntries.set(this.metaData, typedEntries);
                }
                typedEntries.push(this);
            }
        }
    }
    constructor(dbSet, entity, parentEntry) {
        super(dbSet, entity, null);
        this.dbSet = dbSet;
        this.entity = entity;
        this.parentEntry = parentEntry;
        let propertyChangeHandler = entity[propertyChangeHandlerMetaKey];
        if (!propertyChangeHandler) {
            let propertyChangeDispatcher;
            [propertyChangeHandler, propertyChangeDispatcher] = EventHandlerFactory(entity);
            entity[propertyChangeHandlerMetaKey] = propertyChangeHandler;
            entity[propertyChangeDispatherMetaKey] = propertyChangeDispatcher;
        }
        propertyChangeHandler.add((source, arg) => this.onPropertyChanged(arg));
        const parentPropertyChangeHandler = parentEntry.entity[propertyChangeHandlerMetaKey];
        if (!parentPropertyChangeHandler) {
            parentPropertyChangeHandler.add((source, arg) => this.onParentPropertyChange(arg));
        }
    }
    onParentPropertyChange(param) {
        if (param.column === this.column) {
            if (param.oldValue === this.entity) {
                const parentChangeHandler = this.parentEntry.entity[propertyChangeHandlerMetaKey];
                if (parentChangeHandler) {
                    parentChangeHandler.delete((source, arg) => this.onParentPropertyChange(arg));
                }
                this.state = EntityState.Detached;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1iZWRkZWRFbnRpdHlFbnRyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RhdGEvRW1iZWRkZWRFbnRpdHlFbnRyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwQkFBMEI7QUFDMUIsd0RBQXdEO0FBQ3hELE9BQU8sRUFBRSw4QkFBOEIsRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3pHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBS25FLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU1QyxNQUFNLE9BQU8sbUJBQXVDLFNBQVEsV0FBYztJQUV0RSxJQUFXLEtBQUs7UUFDWixPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUNELElBQVcsS0FBSyxDQUFDLEtBQUs7UUFDbEIsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ3hCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ3ZDLE1BQU0sVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLFFBQVEsSUFBSSxLQUFLLEtBQUssV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pLLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEtB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