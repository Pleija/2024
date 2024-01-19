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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsaXRlMy5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL1NxbGl0ZS10cy9kcml2ZXJzL3NxbGl0ZTMubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWlCQSxNQUFNLE9BQU8sYUFBYTtJQUd4QixZQUFZLEVBQW1CO1FBQzdCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO0lBQ2QsQ0FBQztJQUVELFdBQVcsQ0FDVCxLQUFnQyxFQUNoQyxLQUE4QixFQUM5QixPQUFzQjtRQUV0QixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtZQUVoQyxLQUFLLENBQUM7Z0JBQ0osT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ3RDLElBQUksQ0FBQyxFQUFFO3lCQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUM7eUJBQ1osR0FBRyxDQUFDLElBQUksRUFBRSxVQUFTLEdBQUc7d0JBQ3JCLElBQUksR0FBRyxFQUFFLENBQUM7NEJBQ1IsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQ0FDWCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7NEJBQ2IsQ0FBQzs0QkFFRCxPQUFNO3dCQUNSLENBQUM7d0JBRUQsSUFBSSxPQUFPLEVBQUUsQ0FBQzs0QkFDWixNQUFNLE1BQU0sR0FBcUI7Z0NBQy9CLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQ0FDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dDQUNuQixPQUFPLEVBQUUsRUFBRTtnQ0FDWCxRQUFRLEVBQUUsQ0FBQzs2QkFDWixDQUFBOzRCQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTt3QkFDakIsQ0FBQztvQkFDSCxDQUFDLENBQUM7eUJBQ0QsUUFBUSxFQUFFLENBQUE7Z0JBQ2YsQ0FBQzthQUNGLENBQUMsQ0FBQTtZQUVGLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDMUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDUixJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUNWLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtvQkFDWixDQUFDO29CQUNELE9BQU07Z0JBQ1IsQ0FBQztnQkFFRCxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUNaLE9BQU8sRUFBRSxDQUFBO2dCQUNYLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELEtBQUssQ0FDSCxHQUFXLEVBQ1gsSUFBVyxFQUNYLEtBQW9CLEVBQ3BCLE9BQXNCO1FBRXRCLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDUixhQUFhO2dCQUNiLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ2hCLE9BQU07WUFDUixDQUFDO1lBQ0QsTUFBTSxNQUFNLEdBQXFCO2dCQUMvQixPQUFPLEVBQUUsQ0FBQztnQkFDVixNQUFNLEVBQUUsQ0FBQztnQkFDVCxPQUFPLEVBQUUsSUFBSTtnQkFDYixRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDdEIsQ0FBQTtZQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNqQixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxjQUFjLENBQUMsTUFBd0I7UUFDckMsT0FBTztZQUNMLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTTtZQUN2QixJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQ3BDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztnQkFDM0IsTUFBTSxFQUFFLE1BQU0sQ0FBQyxRQUFRO2FBQ3hCO1lBQ0QsWUFBWSxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQzdCLENBQUE7SUFDSCxDQUFDO0lBRUQsS0FBSztRQUNILE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDM0MsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3BCLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUNmLENBQUM7cUJBQU0sQ0FBQztvQkFDTixPQUFPLEVBQUUsQ0FBQTtnQkFDWCxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRiJ9