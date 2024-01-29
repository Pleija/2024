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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9ja0NvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL2VsY3kvTW9jay9Nb2NrQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUdsRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUU3RSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUluRixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUM3RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUdqRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFpQmxELE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxVQUFVLE9BQW1DO0lBQ3BFLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0lBQ2pELE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDO0lBQ3JELE9BQU8sQ0FBQyxhQUFhLEdBQUcsS0FBSyxXQUFXLFFBQWtCO1FBQ3RELElBQUksVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZELElBQUksVUFBVSxZQUFZLGdCQUFnQixFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsWUFBWSxjQUFjLENBQUMsRUFBRSxDQUFDO2dCQUNyRCxVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRSxDQUFDO1FBQ0wsQ0FBQzthQUNJLElBQUksQ0FBQyxDQUFDLFVBQVUsWUFBWSxjQUFjLENBQUMsRUFBRSxDQUFDO1lB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