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

/**
 * Unit tests for src/page/Workspace/SideBar/ResourceTree/DatabaseSearchModal/constant.ts
 *
 * 覆盖目标（design.md §3.5 / §4.2 / §8.2 / §10.3，compat-RISK-3）：
 *   1. PG 对象类型数组经收敛后等于 ['table','column','function','view']
 *      （顺序、长度、内容三维度对齐；不含 'trigger'）
 *   2. 横向回归：MySQL / OB-Mysql / Doris / Oracle / OB-Oracle / SQL Server
 *      / SEARCH_OBJECT_FROM_ALL_DATABASE 等数组在 PG 收敛之后保持原状
 *
 * 测试形式：map case（数组定义所有用例 + forEach 循环生成 it，
 * 等价于 it.each；选 forEach 是因为 odc-client 的 @types/jest@22 不识别 it.each 签名）。
 * Refs: dms-ee#850, compat-RISK-3
 */

// constant.ts 引入了 @/store/helper/page、Workspace/components/TablePage、
// Workspace/components/PackagePage 等重组件链路。本测试仅断言纯静态数组导出，
// 因此 mock 这些模块为最小空对象，避免 jest 拉入 monaco / store / redux 等运行时依赖。
jest.mock('@/store/helper/page', () => ({
  openTableViewPage: jest.fn(),
  openPackageViewPage: jest.fn(),
  openFunctionViewPage: jest.fn(),
  openProcedureViewPage: jest.fn(),
  openTriggerViewPage: jest.fn(),
  openTypeViewPage: jest.fn(),
  openSequenceViewPage: jest.fn(),
  openSynonymViewPage: jest.fn(),
  openViewViewPage: jest.fn(),
  openExternalTableTableViewPage: jest.fn(),
  openMaterializedViewViewPage: jest.fn()
}));

jest.mock('@/page/Workspace/components/TablePage', () => ({
  PropsTab: { DDL: 'DDL' },
  TopTab: { PROPS: 'PROPS' }
}));

jest.mock('@/page/Workspace/components/PackagePage', () => ({
  TopTab: { HEAD: 'HEAD' }
}));

jest.mock('@/constant/label', () => ({
  DbObjectTypeTextMap: jest.fn(() => '')
}));

jest.mock('@/util/intl', () => ({
  formatMessage: jest.fn(({ defaultMessage }) => defaultMessage)
}));

import { ConnectType, DbObjectType } from '@/d.ts';
import { objectTypeConfig } from '@/page/Workspace/SideBar/ResourceTree/DatabaseSearchModal/constant';

describe('DatabaseSearchModal/constant PG object type collapse (compat-RISK-3)', () => {
  const pgTypes = objectTypeConfig[ConnectType.PG];

  it('PG object type list equals [table, column, function, view] strictly', () => {
    expect(pgTypes).toEqual([
      DbObjectType.table,
      DbObjectType.column,
      DbObjectType.function,
      DbObjectType.view
    ]);
    expect(pgTypes).toHaveLength(4);
  });

  it('PG object type list does NOT contain trigger', () => {
    expect(pgTypes).not.toContain(DbObjectType.trigger);
  });

  // map case · PG 资源搜索弹窗在本期不暴露的扩展对象类型
  const forbiddenOnPg: Array<{ name: string; objType: DbObjectType }> = [
    { name: 'trigger forbidden on PG', objType: DbObjectType.trigger },
    { name: 'sequence forbidden on PG', objType: DbObjectType.sequence },
    { name: 'type forbidden on PG', objType: DbObjectType.type },
    { name: 'synonym forbidden on PG', objType: DbObjectType.synonym },
    { name: 'package forbidden on PG', objType: DbObjectType.package },
    { name: 'procedure forbidden on PG', objType: DbObjectType.procedure },
    {
      name: 'materialized_view forbidden on PG',
      objType: DbObjectType.materialized_view
    },
    {
      name: 'external_table forbidden on PG',
      objType: DbObjectType.external_table
    },
    {
      name: 'database forbidden on PG (PG 搜索数组不含 database)',
      objType: DbObjectType.database
    }
  ];

  forbiddenOnPg.forEach(({ name, objType }) => {
    it(name, () => {
      expect(pgTypes).not.toContain(objType);
    });
  });

  // map case · PG 资源搜索弹窗本期保留的对象类型
  const keptOnPg: Array<{ name: string; objType: DbObjectType }> = [
    { name: 'table kept on PG', objType: DbObjectType.table },
    { name: 'column kept on PG', objType: DbObjectType.column },
    { name: 'function kept on PG', objType: DbObjectType.function },
    { name: 'view kept on PG', objType: DbObjectType.view }
  ];

  keptOnPg.forEach(({ name, objType }) => {
    it(name, () => {
      expect(pgTypes).toContain(objType);
    });
  });
});

describe('DatabaseSearchModal/constant lateral regression baseline (compat-RISK-3)', () => {
  // 横向基线快照：本次只动 PG 分支，其它 DBType 分支必须保持现状。
  // 数组值与 support-pg 基线（odc-client@f93589b8）一致。
  const mysqlBaseline = [
    DbObjectType.database,
    DbObjectType.table,
    DbObjectType.external_table,
    DbObjectType.column,
    DbObjectType.function,
    DbObjectType.view,
    DbObjectType.procedure,
    DbObjectType.materialized_view
  ];

  const oracleBaseline = [
    DbObjectType.database,
    DbObjectType.table,
    DbObjectType.external_table,
    DbObjectType.column,
    DbObjectType.function,
    DbObjectType.view,
    DbObjectType.procedure,
    DbObjectType.package,
    DbObjectType.trigger,
    DbObjectType.type,
    DbObjectType.sequence,
    DbObjectType.synonym,
    DbObjectType.materialized_view
  ];

  const sqlServerBaseline = [
    DbObjectType.database,
    DbObjectType.table,
    DbObjectType.external_table,
    DbObjectType.column,
    DbObjectType.function,
    DbObjectType.view,
    DbObjectType.procedure
  ];

  const lateralCases: Array<{
    name: string;
    actual: DbObjectType[];
    expected: DbObjectType[];
  }> = [
    {
      name: 'MYSQL object type baseline unchanged',
      actual: objectTypeConfig[ConnectType.MYSQL],
      expected: mysqlBaseline
    },
    {
      name: 'OB_MYSQL object type baseline unchanged',
      actual: objectTypeConfig[ConnectType.OB_MYSQL],
      expected: mysqlBaseline
    },
    {
      name: 'DORIS object type baseline unchanged',
      actual: objectTypeConfig[ConnectType.DORIS],
      expected: mysqlBaseline
    },
    {
      name: 'ORACLE object type baseline unchanged (trigger 仍存在)',
      actual: objectTypeConfig[ConnectType.ORACLE],
      expected: oracleBaseline
    },
    {
      name: 'OB_ORACLE object type baseline unchanged (trigger 仍存在)',
      actual: objectTypeConfig[ConnectType.OB_ORACLE],
      expected: oracleBaseline
    },
    {
      name: 'SQL_SERVER object type baseline unchanged',
      actual: objectTypeConfig[ConnectType.SQL_SERVER],
      expected: sqlServerBaseline
    },
    {
      name: 'SEARCH_OBJECT_FROM_ALL_DATABASE 仍复用 oracle 全集',
      actual: objectTypeConfig.SEARCH_OBJECT_FROM_ALL_DATABASE,
      expected: oracleBaseline
    }
  ];

  lateralCases.forEach(({ name, actual, expected }) => {
    it(name, () => {
      expect(actual).toEqual(expected);
    });
  });

  // 横向 trigger 维度：MYSQL 体系不含 trigger（基线即如此）；Oracle 体系仍含 trigger。
  it('MYSQL/OB_MYSQL/DORIS object types still do NOT include trigger (baseline)', () => {
    expect(objectTypeConfig[ConnectType.MYSQL]).not.toContain(
      DbObjectType.trigger
    );
    expect(objectTypeConfig[ConnectType.OB_MYSQL]).not.toContain(
      DbObjectType.trigger
    );
    expect(objectTypeConfig[ConnectType.DORIS]).not.toContain(
      DbObjectType.trigger
    );
  });

  it('ORACLE/OB_ORACLE object types still include trigger (baseline)', () => {
    expect(objectTypeConfig[ConnectType.ORACLE]).toContain(
      DbObjectType.trigger
    );
    expect(objectTypeConfig[ConnectType.OB_ORACLE]).toContain(
      DbObjectType.trigger
    );
  });
});
