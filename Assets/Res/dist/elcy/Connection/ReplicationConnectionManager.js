import { PooledConnectionManager } from "./PooledConnectionManager";
export class ReplicationConnectionManager {
    constructor(masterDriver, replicaDrivers, poolOption) {
        this.counter = 0;
        this.driver = masterDriver;
        this.masterConnectionManager = new PooledConnectionManager(masterDriver, poolOption);
        if (replicaDrivers.length <= 0) {
            replicaDrivers.push(masterDriver);
        }
        this.replicaConnectionManagers = replicaDrivers.select((o) => o === masterDriver ? this.masterConnectionManager : new PooledConnectionManager(o, poolOption)).toArray();
        this.nextReplicaManager = this.replicaConnectionManagers[0];
    }
    getAllConnections() {
        const resPromises = [];
        resPromises.push(this.masterConnectionManager.getConnection(true));
        for (const a of this.replicaConnectionManagers) {
            resPromises.push(a.getConnection());
        }
        return Promise.all(resPromises);
    }
    async getConnection(writable) {
        if (writable) {
            return this.masterConnectionManager.getConnection(true);
        }
        this.counter = (this.counter + 1) % this.replicaConnectionManagers.length;
        const manager = this.nextReplicaManager;
        this.nextReplicaManager = this.replicaConnectionManagers[this.counter];
        const connection = await manager.getConnection();
        connection.releaseEvent.add(() => {
            if (this.nextReplicaManager.waitCount > manager.waitCount) {
                this.nextReplicaManager = manager;
            }
        });
        return connection;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwbGljYXRpb25Db25uZWN0aW9uTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9Db25uZWN0aW9uL1JlcGxpY2F0aW9uQ29ubmVjdGlvbk1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFcEUsTUFBTSxPQUFPLDRCQUE0QjtJQUNyQyxZQUFZLFlBQXdCLEVBQUUsY0FBaUMsRUFBRSxVQUF3QjtRQWF6RixZQUFPLEdBQUcsQ0FBQyxDQUFDO1FBWmhCLElBQUksQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO1FBQzNCLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLHVCQUF1QixDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyRixJQUFJLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDN0IsY0FBYyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBSSxDQUFDLHlCQUF5QixHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4SyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFNTSxpQkFBaUI7UUFDcEIsTUFBTSxXQUFXLEdBQWdDLEVBQUUsQ0FBQztRQUNwRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuRSxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQzdDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBQ00sS0FBSyxDQUFDLGFBQWEsQ0FBQyxRQUFrQjtRQUN6QyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ1gsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDO1FBQzFFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUN4QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2RSxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNqRCxVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDN0IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztZQUN0QyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0NBQ0oifQ==