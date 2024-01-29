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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1iZWRkZWRFbnRpdHlFbnRyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EYXRhL0VtYmVkZGVkRW50aXR5RW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEJBQTBCO0FBQzFCLHdEQUF3RDtBQUN4RCxPQUFPLEVBQUUsOEJBQThCLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUtuRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUMsTUFBTSxPQUFPLG1CQUF1QyxTQUFRLFdBQWM7SUFFdEUsSUFBVyxLQUFLO1FBQ1osT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxJQUFXLEtBQUssQ0FBQyxLQUFLO1FBQ2xCLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUN4QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUN2QyxNQUFNLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxRQUFRLElBQUksS0FBSyxLQUFLLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6SyxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxL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