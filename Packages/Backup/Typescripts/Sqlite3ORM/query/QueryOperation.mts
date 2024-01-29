/* eslint-disable @typescript-eslint/ban-types */
import { MetaModel } from '../metadata/index.mjs';

export interface QueryOperation {
  toSql(metaModel: MetaModel, params: Object, tablePrefix: string): Promise<string>;
}
