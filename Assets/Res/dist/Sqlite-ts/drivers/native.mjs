export {};
// import {
//   ResultSet as SQLiteResultSet,
//   SQLiteDatabase
// } from 'react-native-sqlite-storage'
// import {
//   DbDriver,
//   ErrorCallback,
//   QueryCallback,
//   ResultSet,
//   Transaction
// } from '../types'
//
// export class ReactNativeSQLiteStorageDriver implements DbDriver {
//   db: SQLiteDatabase
//   constructor(db: SQLiteDatabase) {
//     this.db = db
//   }
//
//   transaction(
//     scope: (trx: Transaction) => void,
//     error?: (error: any) => void,
//     success?: () => void
//   ) {
//     this.db.transaction(
//       trx =>
//         scope({
//           execSql: (sql, args, resolve, reject) => {
//             trx.executeSql(
//               sql,
//               args,
//               (_, res) => {
//                 if (resolve) {
//                   resolve(res)
//                 }
//               },
//               err => {
//                 if (reject) {
//                   reject(err)
//                 }
//               }
//             )
//           }
//         }),
//       error,
//       success
//     )
//   }
//
//   query(
//     sql: string,
//     args: any[],
//     error: ErrorCallback,
//     success: QueryCallback
//   ) {
//     this.db.executeSql(
//       sql,
//       args,
//       r => {
//         success(r)
//       },
//       error
//     )
//   }
//
//   getQueryResult(result: SQLiteResultSet): ResultSet {
//     const {
//       insertId,
//       rowsAffected,
//       rows: {
//         item,
//         length,
//         // @ts-ignore
//         raw
//       }
//     } = result
//     return {
//       insertId,
//       rowsAffected,
//       rows: {
//         item,
//         length,
//         items: raw
//       }
//     }
//   }
//
//   close(): Promise<void> {    
//     return new Promise<void>((resolve, reject) => {
//       this.db
//         .close()
//         .then(resolve)
//         .catch(reject)
//     })
//   }
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1BhY2thZ2VzL1RzUHJvai9zcmMvU3FsaXRlLXRzL2RyaXZlcnMvbmF0aXZlLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsV0FBVztBQUNYLGtDQUFrQztBQUNsQyxtQkFBbUI7QUFDbkIsdUNBQXVDO0FBQ3ZDLFdBQVc7QUFDWCxjQUFjO0FBQ2QsbUJBQW1CO0FBQ25CLG1CQUFtQjtBQUNuQixlQUFlO0FBQ2YsZ0JBQWdCO0FBQ2hCLG9CQUFvQjtBQUNwQixFQUFFO0FBQ0Ysb0VBQW9FO0FBQ3BFLHVCQUF1QjtBQUN2QixzQ0FBc0M7QUFDdEMsbUJBQW1CO0FBQ25CLE1BQU07QUFDTixFQUFFO0FBQ0YsaUJBQWlCO0FBQ2pCLHlDQUF5QztBQUN6QyxvQ0FBb0M7QUFDcEMsMkJBQTJCO0FBQzNCLFFBQVE7QUFDUiwyQkFBMkI7QUFDM0IsZUFBZTtBQUNmLGtCQUFrQjtBQUNsQix1REFBdUQ7QUFDdkQsOEJBQThCO0FBQzlCLHFCQUFxQjtBQUNyQixzQkFBc0I7QUFDdEIsOEJBQThCO0FBQzlCLGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFDakMsb0JBQW9CO0FBQ3BCLG1CQUFtQjtBQUNuQix5QkFBeUI7QUFDekIsZ0NBQWdDO0FBQ2hDLGdDQUFnQztBQUNoQyxvQkFBb0I7QUFDcEIsa0JBQWtCO0FBQ2xCLGdCQUFnQjtBQUNoQixjQUFjO0FBQ2QsY0FBYztBQUNkLGVBQWU7QUFDZixnQkFBZ0I7QUFDaEIsUUFBUTtBQUNSLE1BQU07QUFDTixFQUFFO0FBQ0YsV0FBVztBQUNYLG1CQUFtQjtBQUNuQixtQkFBbUI7QUFDbkIsNEJBQTRCO0FBQzVCLDZCQUE2QjtBQUM3QixRQUFRO0FBQ1IsMEJBQTBCO0FBQzFCLGFBQWE7QUFDYixjQUFjO0FBQ2QsZUFBZTtBQUNmLHFCQUFxQjtBQUNyQixXQUFXO0FBQ1gsY0FBYztBQUNkLFFBQVE7QUFDUixNQUFNO0FBQ04sRUFBRTtBQUNGLHlEQUF5RDtBQUN6RCxjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCLHNCQUFzQjtBQUN0QixnQkFBZ0I7QUFDaEIsZ0JBQWdCO0FBQ2hCLGtCQUFrQjtBQUNsQix3QkFBd0I7QUFDeEIsY0FBYztBQUNkLFVBQVU7QUFDVixpQkFBaUI7QUFDakIsZUFBZTtBQUNmLGtCQUFrQjtBQUNsQixzQkFBc0I7QUFDdEIsZ0JBQWdCO0FBQ2hCLGdCQUFnQjtBQUNoQixrQkFBa0I7QUFDbEIscUJBQXFCO0FBQ3JCLFVBQVU7QUFDVixRQUFRO0FBQ1IsTUFBTTtBQUNOLEVBQUU7QUFDRixpQ0FBaUM7QUFDakMsc0RBQXNEO0FBQ3RELGdCQUFnQjtBQUNoQixtQkFBbUI7QUFDbkIseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQUN6QixTQUFTO0FBQ1QsTUFBTTtBQUNOLElBQUkifQ==