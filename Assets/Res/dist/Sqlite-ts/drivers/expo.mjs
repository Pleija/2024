export {};
// import {
//   DbDriver,
//   ErrorCallback,
//   QueryCallback,
//   ResultSet,
//   Transaction
// } from '../types'
//
// export class ExpoSQLiteDriver implements DbDriver {
//   db: SQLite.Database
//   constructor(db: SQLite.Database) {
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
//     this.db.transaction(trx => {
//       trx.executeSql(
//         sql,
//         args,
//         (_, r) => {
//           success(r)
//         },
//         error
//       )
//     })
//   }
//
//   getQueryResult(result: SQLite.ResultSet): ResultSet {
//     const {
//       insertId,
//       // @ts-ignore
//       rowsAffected,
//       rows: { _array, length }
//     } = result
//     return {
//       insertId,
//       rowsAffected,
//       rows: {
//         length,
//         item: index => _array[index],
//         items: () => _array
//       }
//     }
//   }
//
//   close(): Promise<void> {
//     return new Promise(resolve => resolve())
//   }
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwby5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL1NxbGl0ZS10cy9kcml2ZXJzL2V4cG8ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxXQUFXO0FBQ1gsY0FBYztBQUNkLG1CQUFtQjtBQUNuQixtQkFBbUI7QUFDbkIsZUFBZTtBQUNmLGdCQUFnQjtBQUNoQixvQkFBb0I7QUFDcEIsRUFBRTtBQUNGLHNEQUFzRDtBQUN0RCx3QkFBd0I7QUFDeEIsdUNBQXVDO0FBQ3ZDLG1CQUFtQjtBQUNuQixNQUFNO0FBQ04sRUFBRTtBQUNGLGlCQUFpQjtBQUNqQix5Q0FBeUM7QUFDekMsb0NBQW9DO0FBQ3BDLDJCQUEyQjtBQUMzQixRQUFRO0FBQ1IsMkJBQTJCO0FBQzNCLGVBQWU7QUFDZixrQkFBa0I7QUFDbEIsdURBQXVEO0FBQ3ZELDhCQUE4QjtBQUM5QixxQkFBcUI7QUFDckIsc0JBQXNCO0FBQ3RCLDhCQUE4QjtBQUM5QixpQ0FBaUM7QUFDakMsaUNBQWlDO0FBQ2pDLG9CQUFvQjtBQUNwQixtQkFBbUI7QUFDbkIseUJBQXlCO0FBQ3pCLGdDQUFnQztBQUNoQyxnQ0FBZ0M7QUFDaEMsb0JBQW9CO0FBQ3BCLGtCQUFrQjtBQUNsQixnQkFBZ0I7QUFDaEIsY0FBYztBQUNkLGNBQWM7QUFDZCxlQUFlO0FBQ2YsZ0JBQWdCO0FBQ2hCLFFBQVE7QUFDUixNQUFNO0FBQ04sRUFBRTtBQUNGLFdBQVc7QUFDWCxtQkFBbUI7QUFDbkIsbUJBQW1CO0FBQ25CLDRCQUE0QjtBQUM1Qiw2QkFBNkI7QUFDN0IsUUFBUTtBQUNSLG1DQUFtQztBQUNuQyx3QkFBd0I7QUFDeEIsZUFBZTtBQUNmLGdCQUFnQjtBQUNoQixzQkFBc0I7QUFDdEIsdUJBQXVCO0FBQ3ZCLGFBQWE7QUFDYixnQkFBZ0I7QUFDaEIsVUFBVTtBQUNWLFNBQVM7QUFDVCxNQUFNO0FBQ04sRUFBRTtBQUNGLDBEQUEwRDtBQUMxRCxjQUFjO0FBQ2Qsa0JBQWtCO0FBQ2xCLHNCQUFzQjtBQUN0QixzQkFBc0I7QUFDdEIsaUNBQWlDO0FBQ2pDLGlCQUFpQjtBQUNqQixlQUFlO0FBQ2Ysa0JBQWtCO0FBQ2xCLHNCQUFzQjtBQUN0QixnQkFBZ0I7QUFDaEIsa0JBQWtCO0FBQ2xCLHdDQUF3QztBQUN4Qyw4QkFBOEI7QUFDOUIsVUFBVTtBQUNWLFFBQVE7QUFDUixNQUFNO0FBQ04sRUFBRTtBQUNGLDZCQUE2QjtBQUM3QiwrQ0FBK0M7QUFDL0MsTUFBTTtBQUNOLElBQUkifQ==