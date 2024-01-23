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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsaXRlMy5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL1NxbGl0ZS10cy9kcml2ZXJzL3NxbGl0ZTMubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWlCQSxNQUFNLE9BQU8sYUFBYTtJQUd0QixZQUFZLEVBQVk7UUFDcEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUE7SUFDaEIsQ0FBQztJQUVELFdBQVcsQ0FDUCxLQUFnQyxFQUNoQyxLQUE4QixFQUM5QixPQUFzQjtRQUV0QixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDbkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtZQUVoQyxLQUFLLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ3BDLElBQUksQ0FBQyxFQUFFO3lCQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUM7eUJBQ1osR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLEdBQUc7d0JBQ3BCLElBQUksR0FBRyxFQUFFLENBQUM7NEJBQ04sSUFBSSxNQUFNLEVBQUUsQ0FBQztnQ0FDVCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7NEJBQ2YsQ0FBQzs0QkFFRCxPQUFNO3dCQUNWLENBQUM7d0JBRUQsSUFBSSxPQUFPLEVBQUUsQ0FBQzs0QkFDVixNQUFNLE1BQU0sR0FBcUI7Z0NBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQ0FDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dDQUNuQixPQUFPLEVBQUUsRUFBRTtnQ0FDWCxRQUFRLEVBQUUsQ0FBQzs2QkFDZCxDQUFBOzRCQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTt3QkFDbkIsQ0FBQztvQkFDTCxDQUFDLENBQUM7eUJBQ0QsUUFBUSxFQUFFLENBQUE7Z0JBQ25CLENBQUM7YUFDSixDQUFDLENBQUE7WUFFRixJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ3hDLElBQUksR0FBRyxFQUFFLENBQUM7b0JBQ04sSUFBSSxLQUFLLEVBQUUsQ0FBQzt3QkFDUixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7b0JBQ2QsQ0FBQztvQkFDRCxPQUFNO2dCQUNWLENBQUM7Z0JBRUQsSUFBSSxPQUFPLEVBQUUsQ0FBQztvQkFDVixPQUFPLEVBQUUsQ0FBQTtnQkFDYixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFRCxLQUFLLENBQ0QsR0FBVyxFQUNYLElBQVcsRUFDWCxLQUFvQixFQUNwQixPQUFzQjtRQUV0QixJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ2pDLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ04sYUFBYTtnQkFDYixLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO2dCQUNoQixPQUFNO1lBQ1YsQ0FBQztZQUNELE1BQU0sTUFBTSxHQUFxQjtnQkFDN0IsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3hCLENBQUE7WUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDbkIsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBRUQsY0FBYyxDQUFDLE1BQXdCO1FBQ25DLE9BQU87WUFDSCxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU07WUFDdkIsSUFBSSxFQUFFO2dCQUNGLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUNwQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU87Z0JBQzNCLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUTthQUMxQjtZQUNELFlBQVksRUFBRSxNQUFNLENBQUMsT0FBTztTQUMvQixDQUFBO0lBQ0wsQ0FBQztJQUVELEtBQUs7UUFDRCxPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNsQixJQUFJLEtBQUssRUFBRSxDQUFDO29CQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDakIsQ0FBQztxQkFBTSxDQUFDO29CQUNKLE9BQU8sRUFBRSxDQUFBO2dCQUNiLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztDQUNKIn0=