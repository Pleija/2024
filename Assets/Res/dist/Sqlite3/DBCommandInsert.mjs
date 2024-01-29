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
        this._command.ClearBinds();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREJDb21tYW5kSW5zZXJ0Lm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3FsaXRlMy9EQkNvbW1hbmRJbnNlcnQubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRCxJQUFPLGFBQWEsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDO0FBSTFELE1BQU0sZUFBZTtJQUNWLFdBQVcsQ0FBUztJQUNuQixLQUFLLENBQWU7SUFDcEIsUUFBUSxDQUFnQjtJQUVoQyxZQUFZLElBQWtCO1FBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFDTSxTQUFTLENBQUMsSUFBa0I7UUFDL0IsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQztJQUMvQixDQUFDO0lBQ00sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDMUUsQ0FBQztJQUNNLGFBQWEsQ0FBQyxJQUFXO1FBQzVCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFDZCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQyxrQkFBa0I7UUFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzQixJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1AsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBQ00sT0FBTztRQUNWLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNWLG1CQUFtQjtZQUNuQixvQkFBb0I7UUFDeEIsQ0FBQztJQUNMLENBQUM7SUFDTyxPQUFPO1FBQ1gsSUFBSSxPQUFPLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRCxPQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFFdkMsb0JBQW9CO1FBQ3BCLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7Q0FDSjtBQUVELE9BQU8sRUFDSCxlQUFlLEdBQ2xCLENBQUEifQ==