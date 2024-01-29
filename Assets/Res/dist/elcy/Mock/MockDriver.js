import { MockConnection } from "./MockConnection";
export class MockDriver {
    constructor(option) {
        this.allowPooling = true;
        if (option) {
            this.database = option.database;
            this.allowPooling = option.allowPooling;
            this.dbType = option.dbType;
            this.schema = option.schema;
        }
    }
    async getConnection() {
        return new MockConnection(this.database);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9ja0RyaXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvZWxjeS9Nb2NrL01vY2tEcml2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBU2xELE1BQU0sT0FBTyxVQUFVO0lBQ25CLFlBQVksTUFBNkI7UUFRbEMsaUJBQVksR0FBRyxJQUFJLENBQUM7UUFQdkIsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUNoQyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDeEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNoQyxDQUFDO0lBQ0wsQ0FBQztJQUtNLEtBQUssQ0FBQyxhQUFhO1FBQ3RCLE9BQU8sSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDSiJ9