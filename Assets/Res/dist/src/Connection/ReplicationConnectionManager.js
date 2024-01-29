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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwbGljYXRpb25Db25uZWN0aW9uTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvc3JjL0Nvbm5lY3Rpb24vUmVwbGljYXRpb25Db25uZWN0aW9uTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVwRSxNQUFNLE9BQU8sNEJBQTRCO0lBQ3JDLFlBQVksWUFBd0IsRUFBRSxjQUFpQyxFQUFFLFVBQXdCO1FBYXpGLFlBQU8sR0FBRyxDQUFDLENBQUM7UUFaaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7UUFDM0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksdUJBQXVCLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JGLElBQUksY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUM3QixjQUFjLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxJQUFJLENBQUMseUJBQXlCLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxJQUFJLHVCQUF1QixDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hLLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQU1NLGlCQUFpQjtRQUNwQixNQUFNLFdBQVcsR0FBZ0MsRUFBRSxDQUFDO1FBQ3BELFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25FLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFDN0MsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFDTSxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQWtCO1FBQ3pDLElBQUksUUFBUSxFQUFFLENBQUM7WUFDWCxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUM7UUFDMUUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQ3hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sVUFBVSxHQUFHLE1BQU0sT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2pELFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUM3QixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUN4RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDO1lBQ3RDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sVUFBVSxDQUFDO0lBQ3RCLENBQUM7Q0FDSiJ9