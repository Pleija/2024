/// <reference lib="decorators" />
/// <reference lib="decorators.legacy" />
/// <reference lib="es5" />
/// <reference lib="es2015.collection" />

type JsArray<T> = Array<T>;

declare namespace CS {

    namespace System.Collections {
        interface IEnumerable extends ArrayConstructor {
        }
    }

    namespace System.Collections.Generic {

        interface List$1<T> extends JsArray<T> {
            ForEach($action: System.Action$2<T, number>): void;
        }

        interface Array$1<T> extends JsArray<T> {

        }

        interface Dictionary$2<TKey, TValue> extends Map<TKey, TValue> {

        }

    }

}