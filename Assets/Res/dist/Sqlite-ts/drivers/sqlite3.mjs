export class SQLite3Driver {
    constructor(db) {
        this.db = db;
    }
    transaction(scope, error, success) {
        this.db.serialize(() => {
            this.db.run('BEGIN TRANSACTION');
            scope({
                execSql: (sql, args, resolve, reject) => {
                    this.db
                        .prepare(sql)
                        .run(args, function (err) {
                        if (err) {
                            if (reject) {
                                reject(err);
                            }
                            return;
                        }
                        if (resolve) {
                            const result = {
                                changes: this.changes,
                                lastID: this.lastID,
                                results: [],
                                rowCount: 0
                            };
                            resolve(result);
                        }
                    })
                        .finalize();
                }
            });
            this.db.run('COMMIT TRANSACTION', [], err => {
                if (err) {
                    if (error) {
                        error(err);
                    }
                    return;
                }
                if (success) {
                    success();
                }
            });
        });
    }
    query(sql, args, error, success) {
        this.db.all(sql, args, (err, rows) => {
            if (err) {
                // @ts-ignore
                error(null, err);
                return;
            }
            const result = {
                changes: 0,
                lastID: 0,
                results: rows,
                rowCount: rows.length
            };
            success(result);
        });
    }
    getQueryResult(result) {
        return {
            insertId: result.lastID,
            rows: {
                item: index => result.results[index],
                items: () => result.results,
                length: result.rowCount
            },
            rowsAffected: result.changes
        };
    }
    close() {
        return new Promise((resolve, reject) => {
            this.db.close(error => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsaXRlMy5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL1NxbGl0ZS10cy9kcml2ZXJzL3NxbGl0ZTMubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWlCQSxNQUFNLE9BQU8sYUFBYTtJQUd4QixZQUFZLEVBQVk7UUFDdEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUE7SUFDZCxDQUFDO0lBRUQsV0FBVyxDQUNULEtBQWdDLEVBQ2hDLEtBQThCLEVBQzlCLE9BQXNCO1FBRXRCLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNyQixJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1lBRWhDLEtBQUssQ0FBQztnQkFDSixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDdEMsSUFBSSxDQUFDLEVBQUU7eUJBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQzt5QkFDWixHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVMsR0FBRzt3QkFDckIsSUFBSSxHQUFHLEVBQUUsQ0FBQzs0QkFDUixJQUFJLE1BQU0sRUFBRSxDQUFDO2dDQUNYLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTs0QkFDYixDQUFDOzRCQUVELE9BQU07d0JBQ1IsQ0FBQzt3QkFFRCxJQUFJLE9BQU8sRUFBRSxDQUFDOzRCQUNaLE1BQU0sTUFBTSxHQUFxQjtnQ0FDL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO2dDQUNyQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0NBQ25CLE9BQU8sRUFBRSxFQUFFO2dDQUNYLFFBQVEsRUFBRSxDQUFDOzZCQUNaLENBQUE7NEJBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO3dCQUNqQixDQUFDO29CQUNILENBQUMsQ0FBQzt5QkFDRCxRQUFRLEVBQUUsQ0FBQTtnQkFDZixDQUFDO2FBQ0YsQ0FBQyxDQUFBO1lBRUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQyxJQUFJLEdBQUcsRUFBRSxDQUFDO29CQUNSLElBQUksS0FBSyxFQUFFLENBQUM7d0JBQ1YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO29CQUNaLENBQUM7b0JBQ0QsT0FBTTtnQkFDUixDQUFDO2dCQUVELElBQUksT0FBTyxFQUFFLENBQUM7b0JBQ1osT0FBTyxFQUFFLENBQUE7Z0JBQ1gsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsS0FBSyxDQUNILEdBQVcsRUFDWCxJQUFXLEVBQ1gsS0FBb0IsRUFDcEIsT0FBc0I7UUFFdEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNuQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNSLGFBQWE7Z0JBQ2IsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtnQkFDaEIsT0FBTTtZQUNSLENBQUM7WUFDRCxNQUFNLE1BQU0sR0FBcUI7Z0JBQy9CLE9BQU8sRUFBRSxDQUFDO2dCQUNWLE1BQU0sRUFBRSxDQUFDO2dCQUNULE9BQU8sRUFBRSxJQUFJO2dCQUNiLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTTthQUN0QixDQUFBO1lBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2pCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELGNBQWMsQ0FBQyxNQUF3QjtRQUNyQyxPQUFPO1lBQ0wsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNO1lBQ3ZCLElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDcEMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO2dCQUMzQixNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVE7YUFDeEI7WUFDRCxZQUFZLEVBQUUsTUFBTSxDQUFDLE9BQU87U0FDN0IsQ0FBQTtJQUNILENBQUM7SUFFRCxLQUFLO1FBQ0gsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUMzQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDcEIsSUFBSSxLQUFLLEVBQUUsQ0FBQztvQkFDVixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ2YsQ0FBQztxQkFBTSxDQUFDO29CQUNOLE9BQU8sRUFBRSxDQUFBO2dCQUNYLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGIn0=