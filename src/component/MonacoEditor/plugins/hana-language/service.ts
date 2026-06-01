/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getTableColumnList, getTableInfo } from '@/common/network/table';
import { getView } from '@/common/network/view';
import { ITableColumn } from '@/d.ts';
import { TableColumn } from '@/page/Workspace/components/CreateTable/interface';
import SessionStore from '@/store/sessionManager/session';

export interface IHanaModelOptions {
  delimiter: string;
  autoNext?: boolean;
  getTableList(
    schemaName: string
  ): Promise<Array<{ name: string; type: string }> | undefined>;
  getTableColumns(
    tableName: string,
    dbName?: string
  ): Promise<Array<{ columnName: string; columnType: string }> | undefined>;
  getSchemaList(): Promise<string[]>;
  getFunctions(): Promise<Array<{ name: string; desc: string }> | undefined>;
  getSnippets(): Promise<
    | Array<{
        label: string;
        documentation: string;
        insertText: string;
      }>
    | undefined
  >;
  getTableDDL(tableName: string, dbName?: string): Promise<string | undefined>;
}

function hasConnect(session: SessionStore) {
  return session?.sessionId && session?.database?.dbName;
}

export function getModelService(
  { modelId: _modelId, delimiter },
  sessionFunc: () => SessionStore
): IHanaModelOptions {
  return {
    get delimiter() {
      return delimiter();
    },
    autoNext: true,
    async getTableList(schemaName: string) {
      const dbName = schemaName || sessionFunc()?.database?.dbName;
      if (!hasConnect(sessionFunc())) {
        return;
      }
      await Promise.race([
        new Promise((resolve) => {
          setTimeout(() => {
            resolve([]);
          }, 300);
        }),
        sessionFunc()?.queryIdentities()
      ]);

      const dbObj =
        sessionFunc()?.allIdentities[dbName] ||
        sessionFunc()?.allIdentities[dbName?.toUpperCase()];
      if (!dbObj) {
        return [];
      }
      return [
        ...(dbObj.tables || []).map((name) => ({ name, type: 'TABLE' })),
        ...(dbObj.views || []).map((name) => ({ name, type: 'VIEW' }))
      ];
    },
    async getTableColumns(tableName: string, dbName?: string) {
      // HANA stores unquoted identifiers as uppercase
      const realTableName = tableName;
      if (!hasConnect(sessionFunc())) {
        return;
      }
      if (!dbName) {
        dbName = sessionFunc()?.database?.dbName;
      }
      if (/[一-龥\w]+/.test(realTableName) && realTableName?.length < 500) {
        await sessionFunc()?.queryIdentities(realTableName);
        const db =
          sessionFunc()?.allIdentities[dbName] ||
          sessionFunc()?.allIdentities[dbName?.toUpperCase()];
        const isTable = db?.tables?.includes(realTableName);
        const isView = db?.views?.includes(realTableName);
        if (isTable) {
          const columns = await getTableColumnList(
            realTableName,
            dbName,
            sessionFunc()?.sessionId
          );
          return columns?.map((column: TableColumn) => ({
            columnName: column.name,
            columnType: column.type
          }));
        }
        if (isView) {
          const view = await getView(
            realTableName,
            sessionFunc()?.sessionId,
            dbName
          );
          return view?.columns?.map((column: ITableColumn) => ({
            columnName: column.columnName,
            columnType: column.dataType
          }));
        }
      }
      return [];
    },
    async getSchemaList() {
      if (!Object.keys(sessionFunc()?.allIdentities || {}).length) {
        sessionFunc()?.queryIdentities();
      }
      return Object.keys(sessionFunc()?.allIdentities || {});
    },
    async getFunctions() {
      if (!sessionFunc()?.database?.functions) {
        await sessionFunc()?.database?.getFunctionList();
      }
      return sessionFunc()?.database?.functions?.map((func) => ({
        name: func.funName,
        desc: func.status
      }));
    },
    async getSnippets() {
      const session = sessionFunc();
      if (session) {
        return session.snippets?.map((item) => {
          return {
            label: item.prefix || '',
            documentation: item.description || '',
            insertText: item.body || ''
          };
        });
      }
    },
    async getTableDDL(tableName: string, dbName?: string) {
      const realTableName = tableName;
      if (!hasConnect(sessionFunc())) {
        return;
      }
      if (!dbName) {
        dbName = sessionFunc()?.database?.dbName;
      }
      if (/[一-龥\w]+/.test(realTableName) && realTableName?.length < 500) {
        await sessionFunc()?.queryIdentities(realTableName);
        const db =
          sessionFunc()?.allIdentities[dbName] ||
          sessionFunc()?.allIdentities[dbName?.toUpperCase()];
        const isTable = db?.tables?.includes(realTableName);
        const isView = db?.views?.includes(realTableName);
        if (isTable) {
          const table = await getTableInfo(
            realTableName,
            dbName,
            sessionFunc()?.sessionId
          );
          return table?.info?.DDL || '';
        }
        if (isView) {
          const view = await getView(
            realTableName,
            sessionFunc()?.sessionId,
            dbName
          );
          return view?.ddl || '';
        }
      }
      return '';
    }
  };
}
