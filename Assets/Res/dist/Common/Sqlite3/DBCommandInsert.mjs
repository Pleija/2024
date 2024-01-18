import { bindParameter } from "./DBCommand.mjs";
var SQLiteCommand = CS.SqlCipher4Unity3D.SQLiteCommand;
class DBCommandInsert {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb21tYW5kSW5zZXJ0Lm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvQ29tbW9uL1NxbGl0ZTMvREJDb21tYW5kSW5zZXJ0Lm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQsSUFBTyxhQUFhLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQztBQUkxRCxNQUFNLGVBQWU7SUFLakIsWUFBWSxJQUFrQjtRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBQ00sU0FBUyxDQUFDLElBQWtCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUNNLE9BQU87UUFDVixPQUFPLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQzFFLENBQUM7SUFDTSxhQUFhLENBQUMsSUFBVztRQUM1QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO1lBQ2QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkMsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDMUIsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNQLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUNNLE9BQU87UUFDVixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzVCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksT0FBTyxFQUFFLENBQUM7WUFDVixtQkFBbUI7WUFDbkIsb0JBQW9CO1FBQ3hCLENBQUM7SUFDTCxDQUFDO0lBQ08sT0FBTztRQUNYLElBQUksT0FBTyxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBRXZDLG9CQUFvQjtRQUNwQixPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0NBQ0o7QUFFRCxPQUFPLEVBQ0gsZUFBZSxHQUNsQixDQUFBIn0=