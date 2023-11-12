declare enum __Puerts_CSharpEnum { }

declare namespace puer {
    import AsyncOperation = CS.UnityEngine.AsyncOperation;
    import AsyncOperationHandle$1 = CS.UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle$1;
    import AsyncOperationHandle = CS.UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationHandle;

    function $ref<T>(x?: T): CS.$Ref<T>;

    function $unref<T>(x: CS.$Ref<T>): T;

    function $set<T>(x: CS.$Ref<T>, val: T): void;

    function $promise<T>(x: CS.$Task<T> | AsyncOperation | AsyncOperationHandle$1<T> | AsyncOperationHandle): Promise<T>;

    function $generic<T extends new (...args: any[]) => any>(genericType: T, ...genericArguments: (typeof __Puerts_CSharpEnum | (new (...args: any[]) => any))[]): T;

    function $genericMethod(genericType: new (...args: any[]) => any, methodName: string, ...genericArguments: (typeof __Puerts_CSharpEnum | (new (...args: any[]) => any))[]): (...args: any[]) => any;

    function $typeof(x: new (...args: any[]) => any): CS.System.Type;

    function $extension(c: Function, e: Function): void;

    function on(eventType: string, listener: Function, prepend?: boolean): void;

    function off(eventType: string, listener: Function): void;

    function emit(eventType: string, ...args: any[]): boolean;

    function loadFile(name: string): { content: string, debugpath: string };

    function fileExists(name: string): boolean;

    function evalScript(name: string): any;

    function require(name: string): any;

    function genRequire(): (name: string) => any;

    function getModuleBySID(id: number): any;

    function clearModuleCache(): void;
}

import puerts = puer;

// compat 1.4- version
// 兼容1.4-版本，不需要可以注释掉
declare module "puerts" {
    export = puerts;
}

// declare module 'puerts'
// {
//     export = puer;
// }

declare function require(name: string): any;