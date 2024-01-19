import { ColumnTypes } from './types.mjs'

export const COLUMN_META_KEY = 'table:column'

export function Column(type: ColumnTypes, size?: number) {
  return Reflect.metadata(COLUMN_META_KEY, { type, size })
}
