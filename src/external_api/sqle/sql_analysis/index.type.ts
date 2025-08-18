/* eslint-disable */
// @ts-nocheck
import { IDirectGetSQLAnalysisResV1 } from '../common.type';

export interface IDirectGetSQLAnalysisV1Params {
  project_name: string;

  instance_name: string;

  schema_name?: string;

  sql?: string;
}

export interface IDirectGetSQLAnalysisV1Return extends IDirectGetSQLAnalysisResV1 {}
