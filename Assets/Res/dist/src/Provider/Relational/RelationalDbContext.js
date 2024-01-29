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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsYXRpb25hbERiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL1Byb3ZpZGVyL1JlbGF0aW9uYWwvUmVsYXRpb25hbERiQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFakQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRXJELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDekQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ3BGLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQzlGLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQ3BHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBR3BGLE1BQU0sT0FBZ0IsbUJBQXdDLFNBQVEsU0FBYztJQUN6RSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQXNCO1FBQzNDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzNJLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdEcsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN2RyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM1RyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRW5ILElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNmLDhCQUE4QjtRQUM5QixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7WUFDN0MsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQXNCLENBQUM7WUFFbEQsTUFBTSxNQUFNLEdBRWtGLEVBQUUsQ0FBQztZQUNqRyxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ3ZDLE1BQU0sWUFBWSxHQUErRCxFQUFFLENBQUM7Z0JBQ3BGLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQzFCLE1BQU0sRUFBRSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNsRywyRkFBMkY7b0JBQzNGLEVBQUUsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO29CQUN4QixZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNoQixJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDdEIsRUFBRSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNwQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUMzQixDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO29CQUM1QixTQUFTO2dCQUNiLENBQUM7Z0JBQ0QsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQzdCLEtBQUssTUFBTSxLQUFLLElBQUksWUFBWSxFQUFFLENBQUM7b0JBQy9CLEtBQUssTUFBTSxPQUFPLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDNUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ2hELEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQzs0QkFDMUIsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQ0FDaEMsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dDQUNqQixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQ0FDdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUM7d0NBQ3pDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7b0NBQzdELENBQUM7Z0NBQ0wsQ0FBQztnQ0FDRCxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzs0QkFDM0IsQ0FBQztpQ0FDSSxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO2dDQUN2QyxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7Z0NBQ2pCLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDO29DQUN0RCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3Q0FDekMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQ0FDN0QsQ0FBQztnQ0FDTCxDQUFDO2dDQUNELFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDOzRCQUM5QixDQUFDO3dCQUNMLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQUNELEtBQUssTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksYUFBYSxFQUFFLENBQUM7Z0JBQ3RDLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxFQUFFLENBQUM7b0JBQzFCLE1BQU0sRUFBRSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNwQixDQUFDO1lBQ0wsQ0FBQztZQUNELEtBQUssTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksYUFBYSxFQUFFLENBQUM7Z0JBQ3RDLG1EQUFtRDtnQkFDbkQsNkNBQTZDO2dCQUM3QyxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU87cUJBQ3RCLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsWUFBWSxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUN2RyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7WUFDTCxDQUFDO1lBQ0QsS0FBSyxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN6Qyw4REFBOEQ7Z0JBQzlELG1DQUFtQztnQkFDbkMsTUFBTSxlQUFlLEdBQUcsT0FBTztxQkFDMUIsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUM7cUJBQ3pHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUNULElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsS0FBSyxXQUFXLEVBQUUsQ0FBQzt3QkFDdkQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDeEUsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFLENBQUM7NEJBQ25CLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3BHLENBQUM7b0JBQ0wsQ0FBQztvQkFDRCxPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsS0FBSyxNQUFNLEtBQUssSUFBSSxlQUFlLEVBQUUsQ0FBQztvQkFDbEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM5QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNwQixDQUFDO1lBQ0wsQ0FBQztZQUNELEtBQUssTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDaEQsTUFBTSxVQUFVLEdBQWUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxlQUFlLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQkFFakgsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLEVBQUUsQ0FBQztvQkFDMUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQ2xELE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7WUFDTCxDQUFDO1lBRUQsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDN0IsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDekIsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMxQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRU0sY0FBYyxDQUFJLEtBQXFCLEVBQUUsVUFBdUI7UUFDbkUsT0FBTyxJQUFJLG1CQUFtQixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ00sY0FBYyxDQUFJLEtBQXFCO1FBQzFDLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ00sbUJBQW1CLENBQWUsYUFBMEM7UUFDL0UsT0FBTyxJQUFJLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFDTSxzQkFBc0IsQ0FBZSxhQUEwQztRQUNsRixPQUFPLElBQUksMkJBQTJCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUNNLGNBQWMsQ0FBSSxLQUFxQjtRQUMxQyxPQUFPLElBQUksbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUNNLGNBQWMsQ0FBSSxLQUFxQjtRQUMxQyxPQUFPLElBQUksbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNKIn0=