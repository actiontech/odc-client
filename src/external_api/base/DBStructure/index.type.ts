/* eslint-disable */
// @ts-nocheck
import { IListTableColumnsReply } from '../common.type';

export interface IListTableColumnsParams {
  project_uid: string;

  db_service_uid: string;

  schema_name: string;

  table_name: string;
}

export interface IListTableColumnsReturn extends IListTableColumnsReply {}
