import { PoolResource } from "../Pool/PoolResource";
export class PooledConnection extends PoolResource {
    get database() {
        return this.connection.database;
    }
    get errorEvent() {
        return this.connection.errorEvent;
    }
    get inTransaction() {
        return this.connection.inTransaction;
    }
    get isolationLevel() {
        return this.connection.isolationLevel;
    }
    get isOpen() {
        return this.connection.isOpen;
    }
    constructor(connection) {
        super();
        this.connection = connection;
    }
    destroy() {
        this.connection.close();
    }
    async close() {
        this.onReleased();
    }
    commitTransaction() {
        return this.connection.commitTransaction();
    }
    open() {
        return this.connection.open();
    }
    query(...command) {
        return this.connection.query(...command);
    }
    reset() {
        return this.connection.reset();
    }
    rollbackTransaction() {
        return this.connection.rollbackTransaction();
    }
    setIsolationLevel(isolationLevel) {
        return this.connection.setIsolationLevel(isolationLevel);
    }
    startTransaction(isolationLevel) {
        return this.connection.startTransaction(isolationLevel);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9vbGVkQ29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9Db25uZWN0aW9uL1Bvb2xlZENvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBS3BELE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxZQUFZO0lBQzlDLElBQVcsUUFBUTtRQUNmLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7SUFDcEMsQ0FBQztJQUNELElBQVcsVUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO0lBQ3RDLENBQUM7SUFDRCxJQUFXLGFBQWE7UUFDcEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztJQUN6QyxDQUFDO0lBQ0QsSUFBVyxjQUFjO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUM7SUFDMUMsQ0FBQztJQUNELElBQVcsTUFBTTtRQUNiLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDbEMsQ0FBQztJQUNELFlBQW1CLFVBQXVCO1FBQ3RDLEtBQUssRUFBRSxDQUFDO1FBRE8sZUFBVSxHQUFWLFVBQVUsQ0FBYTtJQUUxQyxDQUFDO0lBQ00sT0FBTztRQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUNNLEtBQUssQ0FBQyxLQUFLO1FBQ2QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFDTSxpQkFBaUI7UUFDcEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUNNLElBQUk7UUFDUCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUNNLEtBQUssQ0FBQyxHQUFHLE9BQWlCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQ00sS0FBSztRQUNSLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBQ00sbUJBQW1CO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQ2pELENBQUM7SUFDTSxpQkFBaUIsQ0FBQyxjQUE4QjtRQUNuRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNNLGdCQUFnQixDQUFDLGNBQStCO1FBQ25ELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM1RCxDQUFDO0NBQ0oifQ==