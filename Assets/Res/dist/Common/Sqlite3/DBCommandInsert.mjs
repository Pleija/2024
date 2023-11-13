import { bindParameter } from "./DBCommand.mjs";
var SQLiteCommand = CS.SqlCipher4Unity3D.SQLiteCommand;
class DBCommandInsert {
    commandText;
    _conn;
    _command;
    constructor(conn) {
        this._conn = conn;
        this.commandText = "";
    }
    isConnect(conn) {
        return this._conn === conn;
    }
    isValid() {
        return this._conn && this._conn.opened && this._conn.handle.Connected;
    }
    executeUpdate(objs) {
        if (this._conn.trace) {
            console.log(this.commandText + "\nargs:" + objs);
        }
        if (!this._command)
            this._command = this.prepare();
        //bind the values.
        this._command.ClearBind();
        if (objs) {
            objs.forEach(val => bindParameter(this._command, val));
        }
        return this._command.ExecuteNonQuery();
    }
    dispose() {
        let command = this._command;
        this._command = null;
        if (command) {
            //command.Cancel();
            //command.Dispose();
        }
    }
    prepare() {
        let command = new SQLiteCommand(this._conn.handle);
        command.CommandText = this.commandText;
        //command.Prepare();
        return command;
    }
}
export { DBCommandInsert, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb21tYW5kSW5zZXJ0Lm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvREJDb21tYW5kSW5zZXJ0Lm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQsSUFBTyxhQUFhLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQztBQUkxRCxNQUFNLGVBQWU7SUFDVixXQUFXLENBQVM7SUFDbkIsS0FBSyxDQUFlO0lBQ3BCLFFBQVEsQ0FBZ0I7SUFFaEMsWUFBWSxJQUFrQjtRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBQ00sU0FBUyxDQUFDLElBQWtCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUNNLE9BQU87UUFDVixPQUFPLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQzFFLENBQUM7SUFDTSxhQUFhLENBQUMsSUFBVztRQUM1QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDcEQ7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFDZCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQyxrQkFBa0I7UUFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMxQixJQUFJLElBQUksRUFBRTtZQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzFEO1FBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNDLENBQUM7SUFDTSxPQUFPO1FBQ1YsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLE9BQU8sRUFBRTtZQUNULG1CQUFtQjtZQUNuQixvQkFBb0I7U0FDdkI7SUFDTCxDQUFDO0lBQ08sT0FBTztRQUNYLElBQUksT0FBTyxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBRXZDLG9CQUFvQjtRQUNwQixPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0NBQ0o7QUFFRCxPQUFPLEVBQ0gsZUFBZSxHQUNsQixDQUFBIn0=