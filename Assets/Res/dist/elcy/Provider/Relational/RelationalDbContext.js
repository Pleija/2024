import { DbContext } from "../../Data/DbContext";
import { EntityState } from "../../Data/EntityState";
import { RelationState } from "../../Data/RelationState";
import { Enumerable } from "../../Enumerable/Enumerable";
import { isNull } from "../../Helper/Util";
import { DeleteDeferredQuery } from "../../Query/DeferredQuery/DeleteDeferredQuery";
import { InsertDeferredQuery } from "../../Query/DeferredQuery/InsertDeferredQuery";
import { RelationAddDeferredQuery } from "../../Query/DeferredQuery/RelationAddDeferredQuery";
import { RelationDeleteDeferredQuery } from "../../Query/DeferredQuery/RelationDeleteDeferredQuery";
import { UpdateDeferredQuery } from "../../Query/DeferredQuery/UpdateDeferredQuery";
import { UpsertDeferredQuery } from "../../Query/DeferredQuery/UpsertDeferredQuery";
export class RelationalDbContext extends DbContext {
    async saveChanges(options) {
        const addEntries = this.entityEntries.add.asEnumerable().orderBy([(o) => o[0].hasIncrementPrimary, "DESC"], [(o) => o[0].priority, "ASC"]);
        const updateEntries = this.entityEntries.update.asEnumerable().orderBy([(o) => o[0].priority, "ASC"]);
        const deleteEntries = this.entityEntries.delete.asEnumerable().orderBy([(o) => o[0].priority, "DESC"]);
        const relAddEntries = this.relationEntries.add.asEnumerable().orderBy([(o) => o[0].source.priority, "ASC"]);
        const relDeleteEntries = this.relationEntries.delete.asEnumerable().orderBy([(o) => o[0].source.priority, "DESC"]);
        let result = 0;
        // execute all in transaction;
        await this.transaction(async () => {
            const entryMap = new Map();
            const relEntryMap = new Map();
            const defers = [];
            for (const [meta, entries] of addEntries) {
                const insertDefers = [];
                for (const entry of entries) {
                    const nd = options && options.useUpsert ? this.getUpsertQuery(entry) : this.getInsertQuery(entry);
                    // Don't finalize result here. coz it will be used later for update/insert related entities
                    nd.autoFinalize = false;
                    insertDefers.push(nd);
                    defers.push(nd);
                    if (entryMap.has(entry)) {
                        nd.relationId = entryMap.get(entry);
                        entryMap.delete(entry);
                    }
                }
                if (!meta.hasIncrementPrimary) {
                    continue;
                }
                await this.executeDeferred();
                for (const defer of insertDefers) {
                    for (const relName in defer.entry.relationMap) {
                        const relMap = defer.entry.relationMap[relName];
                        for (const [a, b] of relMap) {
                            if (a.state === EntityState.Added) {
                                const relId = {};
                                for (const [sCol, mCol] of b.slaveRelation.relationMaps) {
                                    if (!isNull(defer.data[mCol.propertyName])) {
                                        relId[sCol.propertyName] = defer.data[mCol.propertyName];
                                    }
                                }
                                entryMap.set(a, relId);
                            }
                            else if (b.state === RelationState.Added) {
                                const relId = {};
                                for (const [sCol, mCol] of b.slaveRelation.relationMaps) {
                                    if (!isNull(defer.data[mCol.propertyName])) {
                                        relId[sCol.propertyName] = defer.data[mCol.propertyName];
                                    }
                                }
                                relEntryMap.set(b, relId);
                            }
                        }
                    }
                }
            }
            for (const [, entries] of updateEntries) {
                for (const entry of entries) {
                    const nd = options && options.useUpsert ? this.getUpsertQuery(entry) : this.getUpdateQuery(entry);
                    defers.push(nd);
                }
            }
            for (const [, entries] of relAddEntries) {
                // Filter out new relation with Added slave entity,
                // coz relation has been set at insert query.
                for (const entry of entries
                    .where((o) => !(o.slaveRelation.relationType === "one" && o.slaveEntry.state === EntityState.Added))) {
                    const nd = this.getRelationAddQuery(entry);
                    defers.push(nd);
                }
            }
            for (const [, entries] of relDeleteEntries) {
                // Filter out deleted relation that have related new relation,
                // coz relation have been replaced.
                const filteredEntries = entries
                    .where((o) => o.masterEntry.state !== EntityState.Detached && o.slaveEntry.state !== EntityState.Detached)
                    .where((o) => {
                    if (o.slaveRelation.completeRelationType !== "many-many") {
                        const relGroup = o.slaveEntry.relationMap[o.slaveRelation.propertyName];
                        if (relGroup != null) {
                            return !Enumerable.from(relGroup).any(([, relEntry]) => relEntry.state === RelationState.Added);
                        }
                    }
                    return true;
                });
                for (const entry of filteredEntries) {
                    const nd = this.getRelationDeleteQuery(entry);
                    defers.push(nd);
                }
            }
            for (const [entityMeta, entries] of deleteEntries) {
                const deleteMode = options && options.forceHardDelete || !entityMeta.deletedColumn ? "hard" : "soft";
                for (const entry of entries) {
                    const nd = this.getDeleteQuery(entry, deleteMode);
                    defers.push(nd);
                }
            }
            await this.executeDeferred();
            for (const defer of defers) {
                defer.finalize();
                result += defer.value;
            }
        });
        return result;
    }
    getDeleteQuery(entry, deleteMode) {
        return new DeleteDeferredQuery(entry, deleteMode);
    }
    getInsertQuery(entry) {
        return new InsertDeferredQuery(entry);
    }
    getRelationAddQuery(relationEntry) {
        return new RelationAddDeferredQuery(relationEntry);
    }
    getRelationDeleteQuery(relationEntry) {
        return new RelationDeleteDeferredQuery(relationEntry);
    }
    getUpdateQuery(entry) {
        return new UpdateDeferredQuery(entry);
    }
    getUpsertQuery(entry) {
        return new UpsertDeferredQuery(entry);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25hbERiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9Qcm92aWRlci9SZWxhdGlvbmFsL1JlbGF0aW9uYWxEYkNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWpELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDekQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUNwRixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUNwRixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUM5RixPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSx1REFBdUQsQ0FBQztBQUNwRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUNwRixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUdwRixNQUFNLE9BQWdCLG1CQUF3QyxTQUFRLFNBQWM7SUFDekUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFzQjtRQUMzQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMzSSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdkcsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDNUcsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUVuSCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDZiw4QkFBOEI7UUFDOUIsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQzlCLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1lBQzdDLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO1lBRWxELE1BQU0sTUFBTSxHQUVrRixFQUFFLENBQUM7WUFDakcsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLFlBQVksR0FBK0QsRUFBRSxDQUFDO2dCQUNwRixLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUMxQixNQUFNLEVBQUUsR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDbEcsMkZBQTJGO29CQUMzRixFQUFFLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztvQkFDeEIsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDaEIsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7d0JBQ3RCLEVBQUUsQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDcEMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztnQkFDTCxDQUFDO2dCQUNELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQkFDNUIsU0FBUztnQkFDYixDQUFDO2dCQUNELE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM3QixLQUFLLE1BQU0sS0FBSyxJQUFJLFlBQVksRUFBRSxDQUFDO29CQUMvQixLQUFLLE1BQU0sT0FBTyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQzVDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNoRCxLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7NEJBQzFCLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7Z0NBQ2hDLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztnQ0FDakIsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7b0NBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDO3dDQUN6QyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO29DQUM3RCxDQUFDO2dDQUNMLENBQUM7Z0NBQ0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7NEJBQzNCLENBQUM7aUNBQ0ksSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQ0FDdkMsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dDQUNqQixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQ0FDdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUM7d0NBQ3pDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7b0NBQzdELENBQUM7Z0NBQ0wsQ0FBQztnQ0FDRCxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzs0QkFDOUIsQ0FBQzt3QkFDTCxDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7WUFDRCxLQUFLLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUN0QyxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUMxQixNQUFNLEVBQUUsR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDbEcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEIsQ0FBQztZQUNMLENBQUM7WUFDRCxLQUFLLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUN0QyxtREFBbUQ7Z0JBQ25ELDZDQUE2QztnQkFDN0MsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPO3FCQUN0QixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFlBQVksS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDdkcsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNwQixDQUFDO1lBQ0wsQ0FBQztZQUNELEtBQUssTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztnQkFDekMsOERBQThEO2dCQUM5RCxtQ0FBbUM7Z0JBQ25DLE1BQU0sZUFBZSxHQUFHLE9BQU87cUJBQzFCLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsUUFBUSxDQUFDO3FCQUN6RyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtvQkFDVCxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLEtBQUssV0FBVyxFQUFFLENBQUM7d0JBQ3ZELE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQ3hFLElBQUksUUFBUSxJQUFJLElBQUksRUFBRSxDQUFDOzRCQUNuQixPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEtBQUssYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNwRyxDQUFDO29CQUNMLENBQUM7b0JBQ0QsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLENBQUMsQ0FBQyxDQUFDO2dCQUNQLEtBQUssTUFBTSxLQUFLLElBQUksZUFBZSxFQUFFLENBQUM7b0JBQ2xDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEIsQ0FBQztZQUNMLENBQUM7WUFDRCxLQUFLLE1BQU0sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLElBQUksYUFBYSxFQUFFLENBQUM7Z0JBQ2hELE1BQU0sVUFBVSxHQUFlLE9BQU8sSUFBSSxPQUFPLENBQUMsZUFBZSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBRWpILEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQzFCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNwQixDQUFDO1lBQ0wsQ0FBQztZQUVELE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzdCLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ3pCLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDMUIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLGNBQWMsQ0FBSSxLQUFxQixFQUFFLFVBQXVCO1FBQ25FLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNNLGNBQWMsQ0FBSSxLQUFxQjtRQUMxQyxPQUFPLElBQUksbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUNNLG1CQUFtQixDQUFlLGFBQTBDO1FBQy9FLE9BQU8sSUFBSSx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBQ00sc0JBQXNCLENBQWUsYUFBMEM7UUFDbEYsT0FBTyxJQUFJLDJCQUEyQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFDTSxjQUFjLENBQUksS0FBcUI7UUFDMUMsT0FBTyxJQUFJLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDTSxjQUFjLENBQUksS0FBcUI7UUFDMUMsT0FBTyxJQUFJLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FDSiJ9