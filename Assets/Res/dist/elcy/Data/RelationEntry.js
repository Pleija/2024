import { Enumerable } from "../Enumerable/Enumerable";
import { hasFlags, isNull } from "../Helper/Util";
import { EntityState } from "./EntityState";
import { RelationState } from "./RelationState";
export class RelationEntry {
    get state() {
        return this._state;
    }
    set state(value) {
        if (this._state !== value) {
            const dbContext = this.slaveEntry.dbSet.dbContext;
            switch (this.state) {
                case RelationState.Added: {
                    const typedAddEntries = dbContext.relationEntries.add.get(this.slaveRelation);
                    if (typedAddEntries) {
                        typedAddEntries.delete(this);
                    }
                    break;
                }
                case RelationState.Deleted: {
                    const typedEntries = dbContext.relationEntries.delete.get(this.slaveRelation);
                    if (typedEntries) {
                        typedEntries.delete(this);
                    }
                    break;
                }
                case RelationState.Detached: {
                    if (this.masterEntry.state === EntityState.Detached) {
                        this.masterEntry.state = EntityState.Unchanged;
                    }
                    if (this.slaveEntry.state === EntityState.Detached) {
                        this.slaveEntry.state = EntityState.Unchanged;
                    }
                    break;
                }
            }
            switch (value) {
                case RelationState.Added: {
                    let typedEntries = dbContext.relationEntries.add.get(this.slaveRelation);
                    if (!typedEntries) {
                        typedEntries = [];
                        dbContext.relationEntries.add.set(this.slaveRelation, typedEntries);
                    }
                    typedEntries.push(this);
                    if (this.slaveEntry.state === EntityState.Deleted) {
                        this.slaveEntry.state = EntityState.Unchanged;
                    }
                    if (this.masterEntry.state === EntityState.Deleted) {
                        this.masterEntry.state = EntityState.Unchanged;
                    }
                    break;
                }
                case RelationState.Deleted: {
                    let typedEntries = dbContext.relationEntries.delete.get(this.slaveRelation);
                    if (!typedEntries) {
                        typedEntries = [];
                        dbContext.relationEntries.delete.set(this.slaveRelation, typedEntries);
                    }
                    typedEntries.push(this);
                    break;
                }
            }
            this._state = value;
            switch (value) {
                case RelationState.Detached: {
                    let relMap = this.slaveEntry.relationMap[this.slaveRelation.propertyName];
                    if (relMap) {
                        relMap.delete(this.masterEntry);
                    }
                    relMap = this.masterEntry.relationMap[this.slaveRelation.reverseRelation.propertyName];
                    if (relMap) {
                        relMap.delete(this.slaveEntry);
                    }
                    this.split();
                    break;
                }
                case RelationState.Deleted: {
                    this.split();
                    break;
                }
                default: {
                    this.join();
                    break;
                }
            }
        }
    }
    constructor(slaveEntry, masterEntry, slaveRelation, relationData) {
        this.slaveEntry = slaveEntry;
        this.masterEntry = masterEntry;
        this.slaveRelation = slaveRelation;
        this.relationData = relationData;
        let isDetached = true;
        const state = slaveEntry.state | masterEntry.state;
        if (!hasFlags(state, EntityState.Added | EntityState.Detached)) {
            isDetached = Enumerable.from(slaveRelation.relationMaps).any(([col, masterCol]) => {
                const oVal = slaveEntry.getOriginalValue(col.propertyName);
                return isNull(oVal) || oVal !== masterEntry.getOriginalValue(masterCol.propertyName);
            });
        }
        this._state = isDetached ? RelationState.Detached : RelationState.Unchanged;
    }
    acceptChanges() {
        switch (this.state) {
            case RelationState.Added: {
                this.state = RelationState.Unchanged;
                break;
            }
            case RelationState.Deleted:
            case RelationState.Detached: {
                this.state = RelationState.Detached;
                break;
            }
        }
    }
    add() {
        this.state = this.state === RelationState.Deleted ? RelationState.Unchanged : RelationState.Added;
    }
    delete() {
        this.state = this.state === RelationState.Added || this.state === RelationState.Detached ? RelationState.Detached : RelationState.Deleted;
    }
    join() {
        // apply slave relation property
        if (this.slaveRelation.relationType === "one") {
            this.slaveEntry.entity[this.slaveRelation.propertyName] = this.masterEntry.entity;
        }
        else {
            let relationVal = this.slaveEntry.entity[this.slaveRelation.propertyName];
            if (!Array.isArray(relationVal)) {
                relationVal = [];
                this.slaveEntry.entity[this.slaveRelation.propertyName] = relationVal;
            }
            relationVal.add(this.masterEntry.entity);
        }
        // apply master relation property
        const masterRelation = this.slaveRelation.reverseRelation;
        if (masterRelation.relationType === "one") {
            this.masterEntry.entity[masterRelation.propertyName] = this.slaveEntry.entity;
        }
        else {
            let relationVal = this.masterEntry.entity[masterRelation.propertyName];
            if (!Array.isArray(relationVal)) {
                relationVal = [];
                this.masterEntry.entity[masterRelation.propertyName] = relationVal;
            }
            relationVal.add(this.slaveEntry.entity);
        }
        if (this.slaveRelation.completeRelationType !== "many-many") {
            const cols = this.slaveRelation.mappedRelationColumns.where((o) => !!o.propertyName);
            for (const col of cols) {
                const reverseProperty = this.slaveRelation.relationMaps.get(col).propertyName;
                if (reverseProperty) {
                    const value = this.masterEntry.entity[reverseProperty];
                    this.slaveEntry.entity[col.propertyName] = value;
                }
            }
        }
    }
    split() {
        // detach slave relation property
        if (this.slaveRelation.relationType === "one") {
            this.slaveEntry.entity[this.slaveRelation.propertyName] = null;
        }
        else {
            const relationVal = this.slaveEntry.entity[this.slaveRelation.propertyName];
            if (Array.isArray(relationVal)) {
                relationVal.delete(this.masterEntry.entity);
            }
        }
        // detach master relation property
        const masterRelation = this.slaveRelation.reverseRelation;
        if (masterRelation.relationType === "one") {
            this.masterEntry.entity[masterRelation.propertyName] = null;
        }
        else {
            const relationVal = this.masterEntry.entity[masterRelation.propertyName];
            if (Array.isArray(relationVal)) {
                relationVal.delete(this.slaveEntry.entity);
            }
        }
        // NOTE: MAYBE CAN BE REMOVED?
        if (this.slaveRelation.relationType === "one") {
            const cols = this.slaveRelation.mappedRelationColumns.where((o) => !o.isPrimaryColumn && !!o.propertyName);
            for (const col of cols) {
                this.slaveEntry.entity[col.propertyName] = null;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25FbnRyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9EYXRhL1JlbGF0aW9uRW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHbEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQsTUFBTSxPQUFPLGFBQWE7SUFDdEIsSUFBVyxLQUFLO1FBQ1osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxJQUFXLEtBQUssQ0FBQyxLQUFLO1FBQ2xCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUN4QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDbEQsUUFBUSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2pCLEtBQUssYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQzlFLElBQUksZUFBZSxFQUFFLENBQUM7d0JBQ2xCLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2pDLENBQUM7b0JBQ0QsTUFBTTtnQkFDVixDQUFDO2dCQUNELEtBQUssYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxD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