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

// PostgreSQL 数据服务接口
export interface IPGModelOptions {
  delimiter: string;
  /**
   * 自动提示下一个token,默认为true
   */
  autoNext?: boolean;
  getTableList(
    schemaName: string
  ): Promise<Array<{ name: string; type: string }> | undefined>;
  getTableColumns(
    tableName: string,
    schemaName?: string
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
  getTableDDL(tableName: string, schemaName?: string): Promise<string | undefined>;
}

function hasConnect(session: SessionStore) {
  return session?.sessionId && session?.database?.dbName;
}

export function getModelService(
  { modelId: _modelId, delimiter },
  sessionFunc: () => SessionStore
): IPGModelOptions {
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
      /**
       * 保证200ms内返回，不返回就用上一次的值
       */
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
        sessionFunc()?.allIdentities[dbName?.toLowerCase()];
      if (!dbObj) {
        return [];
      }
      // PostgreSQL 支持表、视图、物化视图、外部表
      return [
        ...(dbObj.tables || []).map((name) => ({ name, type: 'TABLE' })),
        ...(dbObj.views || []).map((name) => ({ name, type: 'VIEW' })),
        ...(dbObj.materialized_view || []).map((name) => ({
          name,
          type: 'MATERIALIZED_VIEW'
        })),
        ...(dbObj.external_table || []).map((name) => ({
          name,
          type: 'FOREIGN_TABLE'
        }))
      ];
    },
    async getTableColumns(tableName: string, schemaName?: string) {
      // PostgreSQL 使用小写标识符
      const realTableName = tableName.toLowerCase();
      if (!hasConnect(sessionFunc())) {
        return;
      }
      const dbName = schemaName || sessionFunc()?.database?.dbName;
      if (
        /[\u4e00-\u9fa5\w]+/.test(realTableName) &&
        realTableName?.length < 500
      ) {
        await sessionFunc()?.queryIdentities(realTableName);
        const db =
          sessionFunc()?.allIdentities[dbName] ||
          sessionFunc()?.allIdentities[dbName?.toLowerCase()];
        const isTable = db?.tables?.includes(realTableName);
        const isView = db?.views?.includes(realTableName);
        if (isTable) {
          const columns = await getTableColumnList(
            realTableName,
            dbName,
            sessionFunc()?.sessionId
          );
          // 表
          return columns?.map((column: TableColumn) => ({
            columnName: column.name,
            columnType: column.type
          }));
        }
        if (isView) {
          // 视图
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
    async getTableDDL(tableName: string, schemaName?: string) {
      // PostgreSQL 使用小写标识符
      const realTableName = tableName.toLowerCase();
      if (!hasConnect(sessionFunc())) {
        return;
      }
      const dbName = schemaName || sessionFunc()?.database?.dbName;
      if (
        /[\u4e00-\u9fa5\w]+/.test(realTableName) &&
        realTableName?.length < 500
      ) {
        /**
         * schemaStore.queryIdentities(); 不能是阻塞的，编辑器对于函数的超时时间有严格的要求，不能超过 300ms，调用这个接口肯定会超过这个时间。
         */
        await sessionFunc()?.queryIdentities(realTableName);
        const db =
          sessionFunc()?.allIdentities[dbName] ||
          sessionFunc()?.allIdentities[dbName?.toLowerCase()];
        const isTable = db?.tables?.includes(realTableName);
        const isView = db?.views?.includes(realTableName);
        if (isTable) {
          const table = await getTableInfo(
            realTableName,
            dbName,
            sessionFunc()?.sessionId
          );
          // 返回 PostgreSQL 表的 DDL
          return table?.info?.DDL || '';
        }
        if (isView) {
          // 视图
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
