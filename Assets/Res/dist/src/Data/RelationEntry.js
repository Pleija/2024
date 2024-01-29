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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25FbnRyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0RhdGEvUmVsYXRpb25FbnRyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUdsRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRCxNQUFNLE9BQU8sYUFBYTtJQUN0QixJQUFXLEtBQUs7UUFDWixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUNELElBQVcsS0FBSyxDQUFDLEtBQUs7UUFDbEIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ3hCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNsRCxRQUFRLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDakIsS0FBSyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDdkIsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDOUUsSUFBSSxlQUFlLEVBQUUsQ0FBQzt3QkFDbEIsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDakMsQ0FBQztvQkFDRCxNQUFNO2dCQUNWLENBQUM7Z0JBQ0QsS0FBSyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDekIsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENB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