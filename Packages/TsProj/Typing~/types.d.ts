// /// <reference lib="decorators" />
// /// <reference lib="decorators.legacy" />
// /// <reference lib="es5" />
// /// <reference lib="es2015.collection" />
//
// type JsArray<T> = Array<T>;
// type string = string & CS.System.String;
// // type Object = Object & CS.System.Object;
//
// declare namespace CS {
//
//     namespace System {
//         interface Array$1<T> extends System.Array,JsArray<T> {
//
//         }
//     }
//
//     namespace System.Collections {
//         interface IEnumerable extends ArrayConstructor {
//         }
//     }
//
//     namespace System.Collections.Generic {
//
//         interface List$1<T> extends JsArray<T> {
//             ForEach($action: System.Action$2<T, number>): void;
//         }
//
//
//         interface Dictionary$2<TKey, TValue> extends Map<TKey, TValue> {
//
//         }
//
//     }
//
// }
