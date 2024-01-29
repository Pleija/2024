import { PooledConnection } from "../Connection/PooledConnection";
import { BulkDeferredQuery } from "../Query/DeferredQuery/BulkDeferredQuery";
import { ExecuteDeferredQuery } from "../Query/DeferredQuery/ExecuteDeferredQuery";
import { CustomEntityExpression } from "../Queryable/QueryExpression/CustomEntityExpression";
import { DeleteExpression } from "../Queryable/QueryExpression/DeleteExpression";
import { MockConnection } from "./MockConnection";
export const mockContext = function (context) {
    context.oriGetConnection = context.getConnection;
    context.oriExecuteDeferred = context.executeDeferred;
    context.getConnection = async function (writable) {
        let connection = await this.oriGetConnection(writable);
        if (connection instanceof PooledConnection) {
            if (!(connection.connection instanceof MockConnection)) {
                connection.connection = new MockConnection(connection.database);
            }
        }
        else if (!(connection instanceof MockConnection)) {
            connection = new MockConnection(connection.database);
        }
        return connection;
    };
    context.executeDeferred = async function (deferredQueries) {
        if (!deferredQueries) {
            deferredQueries = context.deferredQueries;
        }
        const mockQueries = deferredQueries.select((o) => mockDefer(o)).toArray();
        this.connection = await this.getConnection();
        const mockConnection = this.connection instanceof PooledConnection ? this.connection.connection : this.connection;
        mockConnection.setQueries(mockQueries);
        return context.oriExecuteDeferred.apply(this, Array.from(arguments));
    };
};
function mockDefer(defer) {
    const mock = defer;
    if (mock.buildQueries) {
        mock.queryExps = mock.buildQueries(mock.dbContext.queryVisitor);
    }
    else if (mock.buildQuery) {
        mock.queryExps = [mock.buildQuery(mock.dbContext.queryVisitor)];
    }
    else if (mock instanceof BulkDeferredQuery) {
        mock.queryExps = mock.defers.selectMany((o) => mockDefer(o).queryExps).toArray();
    }
    else if (mock instanceof ExecuteDeferredQuery) {
        mock.queryExps = [new DeleteExpression(new CustomEntityExpression("", [], Object, ""), "hard")];
        mock.tvpMap = new Map();
    }
    mock.oriToQuery = mock.toQuery;
    mock.toQuery = function (template, stackTree, tvpMap) {
        this.tvpMap = tvpMap || new Map();
        return mock.oriToQuery(template, stackTree, this.tvpMap);
    };
    return mock;
}
export function restore(context) {
    context.getConnection = context.oriGetConnection;
    context.oriGetConnection = undefined;
    context.executeDeferred = context.oriExecuteDeferred;
    context.oriExecuteDeferred = undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9ja0NvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL3NyYy9Nb2NrL01vY2tDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBR2xFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBRTdFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBSW5GLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBR2pGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQWlCbEQsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLFVBQVUsT0FBbUM7SUFDcEUsT0FBTyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7SUFDakQsT0FBTyxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUM7SUFDckQsT0FBTyxDQUFDLGFBQWEsR0FBRyxLQUFLLFdBQVcsUUFBa0I7UUFDdEQsSUFBSSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkQsSUFBSSxVQUFVLFlBQVksZ0JBQWdCLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxZQUFZLGNBQWMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JELFVBQVUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BFLENBQUM7UUFDTCxDQUFDO2FBQ0ksSUFBSSxDQUFDLENBQUMsVUFBVSxZQUFZLGNBQWMsQ0FBQyxFQUFFLENBQUM7WUFDL0MsVUFBVSxHQUFHLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxDQUFDLGVBQWUsR0FBRyxLQUFLLFdBQVcsZUFBNEM7UUFDbEYsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ25CLGVBQWUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDO1FBQzlDLENBQUM7UUFDRCxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMxRSxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzdDLE1BQU0sY0FBYyxHQUFtQixJQUFJLENBQUMsVUFBVSxZQUFZLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFpQixDQUFDO1FBQ2hKLGNBQWMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkMsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBQ0YsU0FBUyxTQUFTLENBQUMsS0FBb0I7SUFDbkMsTUFBTSxJQUFJLEdBQXlDLEtBQVksQ0FBQztJQUNoRSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNwRSxDQUFDO1NBQ0ksSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7U0FDSSxJQUFJLElBQUksWUFBWSxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNyRixDQUFDO1NBQ0ksSUFBSSxJQUFJLFlBQVksb0JBQW9CLEVBQUUsQ0FBQztRQUM1QyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLHNCQUFzQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLFFBQXdCLEVBQUUsU0FBb0MsRUFBRSxNQUFvRDtRQUN6SSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3RCxDQUFDLENBQUM7SUFFRixPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBQ0QsTUFBTSxVQUFVLE9BQU8sQ0FBQyxPQUFtQztJQUN2RCxPQUFPLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztJQUNqRCxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO0lBQ3JDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDO0lBQ3JELE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLENBQUM7QUFDM0MsQ0FBQyJ9