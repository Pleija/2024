export class SQLite3Driver {
    db;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsaXRlMy5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL1NxbGl0ZS10cy9kcml2ZXJzL3NxbGl0ZTMubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWlCQSxNQUFNLE9BQU8sYUFBYTtJQUN0QixFQUFFLENBQVU7SUFFWixZQUFZLEVBQVk7UUFDcEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUE7SUFDaEIsQ0FBQztJQUVELFdBQVcsQ0FDUCxLQUFnQyxFQUNoQyxLQUE4QixFQUM5QixPQUFzQjtRQUV0QixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDbkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtZQUVoQyxLQUFLLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ3BDLElBQUksQ0FBQyxFQUFFO3lCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUM7eUJBQ1osR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLEdBQUc7d0JBQ3BCLElBQUksR0FBRyxFQUFFLENBQUM7NEJBQ04sSUFBSSxNQUFNLEVBQUUsQ0FBQztnQ0FDVCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7NEJBQ2YsQ0FBQzs0QkFFRCxPQUFNO3dCQUNWLENBQUM7d0JBRUQsSUFBSSxPQUFPLEVBQUUsQ0FBQzs0QkFDVixNQUFNLE1BQU0sR0FBcUI7Z0NBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQ0FDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dDQUNuQixPQUFPLEVBQUUsRUFBRTtnQ0FDWCxRQUFRLEVBQUUsQ0FBQzs2QkFDZCxDQUFBOzRCQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTt3QkFDbkIsQ0FBQztvQkFDTCxDQUFDLENBQUM7eUJBQ0QsUUFBUSxFQUFFLENBQUE7Z0JBQ2YsQ0FBQzthQUNKLENBQUMsQ0FBQTtZQUVGLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDeEMsSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDTixJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUNSLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtvQkFDZCxDQUFDO29CQUNELE9BQU07Z0JBQ1YsQ0FBQztnQkFFRCxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUNWLE9BQU8sRUFBRSxDQUFBO2dCQUNiLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVELEtBQUssQ0FDRCxHQUFXLEVBQ1gsSUFBVyxFQUNYLEtBQW9CLEVBQ3BCLE9BQXNCO1FBRXRCLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDakMsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDTixhQUFhO2dCQUNiLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ2hCLE9BQU07WUFDVixDQUFDO1lBQ0QsTUFBTSxNQUFNLEdBQXFCO2dCQUM3QixPQUFPLEVBQUUsQ0FBQztnQkFDVixNQUFNLEVBQUUsQ0FBQztnQkFDVCxPQUFPLEVBQUUsSUFBSTtnQkFDYixRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDeEIsQ0FBQTtZQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNuQixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFRCxjQUFjLENBQUMsTUFBd0I7UUFDbkMsT0FBTztZQUNILFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTTtZQUN2QixJQUFJLEVBQUU7Z0JBQ0YsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQ3BDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztnQkFDM0IsTUFBTSxFQUFFLE1BQU0sQ0FBQyxRQUFRO2FBQzFCO1lBQ0QsWUFBWSxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQy9CLENBQUE7SUFDTCxDQUFDO0lBRUQsS0FBSztRQUNELE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDekMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xCLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUNqQixDQUFDO3FCQUFNLENBQUM7b0JBQ0osT0FBTyxFQUFFLENBQUE7Z0JBQ2IsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0NBQ0oifQ==