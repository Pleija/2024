import { FunctionExpression } from "../ExpressionBuilder/Expression/FunctionExpression";
import { IExpression } from "../ExpressionBuilder/Expression/IExpression";
import { TimeSpan } from "./TimeSpan";
import { Uuid } from "./Uuid";

export interface IObjectType<T = any> { new(...values: any[]): T; name?: string; }
export interface IEnumType<T extends string | number> { [key: string]: T; }
export type Pivot<T,
    TD extends { [key: string]: (item: T) => ValueType },
    TM extends { [key: string]: (item: T[]) => ValueType }>
    = { [key in keyof TD]: ReturnType<TD[key]> } & { [key in keyof TM]: ReturnType<TM[key]> };
export type GenericType<T = any> = IObjectType<T> | ((...value: any[]) => T);
export type ObjectLike<T> = { [key in keyof T]?: T[key] };
export type FlatObjectLike<T> = { [key in keyof T]?: T[key] & ValueType };
export type PropertySelector<TE> = keyof TE | ((source: TE) => ValueType);
export type ResultSelector<T, TR> = ((item: T) => TR) | FunctionExpression<TR> | { [key in keyof TR]?: TR[key] | ((item: T) => TR[key]) };
export type PredicateSelector<T> = ((item: T) => boolean) | FunctionExpression<boolean>;
export type ObjectFunctionExpression<T> = FunctionExpression<{ [key in keyof T]?: IExpression<T[key]> }>;
export type KeysExceptType<T, TProp> = { [P in keyof T]: T[P] extends TProp ? never : P }[keyof T];
export type KeysType<T, TProp> = { [P in keyof T]: T[P] extends TProp ? P : never }[keyof T];
export type TypeItem<T> = (T extends Array<(infer U)> ? U : T);
export type ValueType = number | string | boolean | Date | TimeSpan | Uuid | ArrayBufferView;
export type ArrayView = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array
    | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | ArrayBufferView;
