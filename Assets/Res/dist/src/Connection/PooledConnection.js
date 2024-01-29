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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9vbGVkQ29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0Nvbm5lY3Rpb24vUG9vbGVkQ29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFLcEQsTUFBTSxPQUFPLGdCQUFpQixTQUFRLFlBQVk7SUFDOUMsSUFBVyxRQUFRO1FBQ2YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztJQUNwQyxDQUFDO0lBQ0QsSUFBVyxVQUFVO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7SUFDdEMsQ0FBQztJQUNELElBQVcsYUFBYTtRQUNwQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO0lBQ3pDLENBQUM7SUFDRCxJQUFXLGNBQWM7UUFDckIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQztJQUMxQyxDQUFDO0lBQ0QsSUFBVyxNQUFNO1FBQ2IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztJQUNsQyxDQUFDO0lBQ0QsWUFBbUIsVUFBdUI7UUFDdEMsS0FBSyxFQUFFLENBQUM7UUFETyxlQUFVLEdBQVYsVUFBVSxDQUFhO0lBRTFDLENBQUM7SUFDTSxPQUFPO1FBQ1YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBQ00sS0FBSyxDQUFDLEtBQUs7UUFDZCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUNNLGlCQUFpQjtRQUNwQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBQ00sSUFBSTtRQUNQLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBQ00sS0FBSyxDQUFDLEdBQUcsT0FBaUI7UUFDN0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFDTSxLQUFLO1FBQ1IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFDTSxtQkFBbUI7UUFDdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDakQsQ0FBQztJQUNNLGlCQUFpQixDQUFDLGNBQThCO1FBQ25ELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBQ00sZ0JBQWdCLENBQUMsY0FBK0I7UUFDbkQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVELENBQUM7Q0FDSiJ9