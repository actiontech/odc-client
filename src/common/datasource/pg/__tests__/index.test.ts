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
 * Unit tests for src/common/datasource/pg/index.tsx
 *
 * 覆盖目标（design.md §3.5 / §4.2 / §10.3，compat-RISK-3）：
 *   1. PG `features.task` 经收敛后等于 [TaskType.ASYNC]
 *   2. PG 其它 features 字段保持原状（sessionManage / sessionParams / sqlExplain /
 *      plRun / groupResourceTree / sqlconsole = true；obclient / recycleBin = false）
 *   3. 横向回归：MySQL / Oracle / OceanBase 各自 features.task 数组未受波及
 *
 * 测试形式：map case（数组定义所有用例 + forEach 循环生成 it，
 * 等价于 it.each；选 forEach 是因为 odc-client 的 @types/jest@22 不识别 it.each 签名）。
 * Refs: dms-ee#850, compat-RISK-3
 */

// haveOCP() 依赖 webpack DefinePlugin 注入的 HAVEOCP 常量，jest 运行时未注入，
// 因此显式 mock 让 haveOCP() 返回 false，避免触发 pg/index.tsx 末尾的 delete 分支。
jest.mock('@/util/env', () => ({
  haveOCP: () => false,
  isClient: () => false,
  hasEventTrackingPermission: () => false
}));

// pg/index.tsx 静态 import MySQLColumnExtra（来自 oceanbase），而该组件的依赖链
// 引入了 src/util/intl.tsx -> @umijs/max -> esbuild 运行时检查，在 jsdom 测试环境
// 下会失败。本测试只断言 PG datasource 静态导出，不渲染 React 组件，因此 mock 之。
jest.mock('@/common/datasource/oceanbase/MySQLColumnExtra', () => ({
  __esModule: true,
  default: () => null
}));

// mysql/oracle/oceanbase 三套 lateral 基线引用 ColumnExtra 同链路，全部以最小 mock 代替。
jest.mock('@/common/datasource/oceanbase/OracleColumnExtra', () => ({
  __esModule: true,
  default: () => null
}));

import { ConnectType, TaskType } from '@/d.ts';
import pgItems from '@/common/datasource/pg';
import mysqlItems from '@/common/datasource/mysql';
import oracleItems from '@/common/datasource/oracle';
import obItems from '@/common/datasource/oceanbase/obmysql';

const pgConfig = pgItems[ConnectType.PG];

describe('datasource/pg/index features.task collapse (compat-RISK-3)', () => {
  it('exports a config keyed by ConnectType.PG', () => {
    expect(pgConfig).toBeDefined();
  });

  it('features.task equals [TaskType.ASYNC] (only ASYNC kept)', () => {
    expect(pgConfig.features.task).toEqual([TaskType.ASYNC]);
    expect(pgConfig.features.task).toHaveLength(1);
    expect(pgConfig.features.task[0]).toBe(TaskType.ASYNC);
  });

  // map case · 旧任务类型必须全部移除
  const removedTaskCases: Array<{ name: string; taskType: TaskType }> = [
    { name: 'SQL_PLAN removed', taskType: TaskType.SQL_PLAN },
    { name: 'DATA_ARCHIVE removed', taskType: TaskType.DATA_ARCHIVE },
    { name: 'DATA_DELETE removed', taskType: TaskType.DATA_DELETE },
    { name: 'IMPORT removed', taskType: TaskType.IMPORT },
    { name: 'EXPORT removed', taskType: TaskType.EXPORT },
    { name: 'EXPORT_RESULT_SET removed', taskType: TaskType.EXPORT_RESULT_SET },
    {
      name: 'STRUCTURE_COMPARISON removed',
      taskType: TaskType.STRUCTURE_COMPARISON
    },
    { name: 'MULTIPLE_ASYNC removed', taskType: TaskType.MULTIPLE_ASYNC }
  ];

  removedTaskCases.forEach(({ name, taskType }) => {
    it(`features.task should NOT contain ${name}`, () => {
      expect(pgConfig.features.task).not.toContain(taskType);
    });
  });
});

describe('datasource/pg/index other features unchanged (compat-RISK-3)', () => {
  // map case · 其它 features 字段保持现状（与 product.md §5 / design.md §3.5 一致）
  const featuresCases: Array<{ name: string; key: string; expected: boolean }> =
    [
      {
        name: 'sessionManage stays true',
        key: 'sessionManage',
        expected: true
      },
      // PG 无 MySQL 风格的 session variables 管理页面
      {
        name: 'sessionParams collapses to false (PG has no MySQL session variables page)',
        key: 'sessionParams',
        expected: false
      },
      { name: 'sqlExplain stays true', key: 'sqlExplain', expected: true },
      // PG PL/pgSQL 函数不能像 OB PL 在 ODC 内独立运行调试
      {
        name: 'plRun collapses to false (PG PL/pgSQL not independently runnable)',
        key: 'plRun',
        expected: false
      },
      {
        name: 'groupResourceTree stays true',
        key: 'groupResourceTree',
        expected: true
      },
      { name: 'sqlconsole stays true', key: 'sqlconsole', expected: true },
      { name: 'obclient stays false', key: 'obclient', expected: false },
      { name: 'recycleBin stays false', key: 'recycleBin', expected: false }
    ];

  featuresCases.forEach(({ name, key, expected }) => {
    it(`${name} (features.${key} === ${expected})`, () => {
      expect(pgConfig.features[key]).toBe(expected);
    });
  });

  it('features.export object preserves PG defaults (fileLimit/snapshot=false)', () => {
    expect(pgConfig.features.export).toEqual({
      fileLimit: false,
      snapshot: false
    });
  });

  it('schema.innerSchema preserves PG built-in schema list', () => {
    expect(pgConfig.schema.innerSchema).toEqual([
      'postgres',
      'information_schema',
      'pg_catalog'
    ]);
  });

  it('sql.language stays "pg"', () => {
    expect(pgConfig.sql.language).toBe('pg');
  });
});

describe('datasource/pg/index lateral regression baseline (compat-RISK-3)', () => {
  // 横向回归 · MySQL / Oracle / OceanBase 的 features.task 必须与 support-pg 基线一致：
  // - MySQL：12 项（含 LOGICAL_DATABASE_CHANGE / DATAMOCK）
  // - Oracle：8 项（含 IMPORT / EXPORT / EXPORT_RESULT_SET / SQL_PLAN / ASYNC /
  //   DATA_DELETE / DATA_ARCHIVE / MULTIPLE_ASYNC）
  // - OB-MySQL：Object.values(TaskType) 全集
  const lateralCases: Array<{
    name: string;
    actual: TaskType[];
    expected: TaskType[];
  }> = [
    {
      name: 'MySQL features.task baseline (12 items, contains DATAMOCK)',
      actual: mysqlItems[ConnectType.MYSQL].features.task,
      expected: [
        TaskType.ASYNC,
        TaskType.DATAMOCK,
        TaskType.SQL_PLAN,
        TaskType.DATA_ARCHIVE,
        TaskType.DATA_DELETE,
        TaskType.IMPORT,
        TaskType.EXPORT,
        TaskType.EXPORT_RESULT_SET,
        TaskType.STRUCTURE_COMPARISON,
        TaskType.MULTIPLE_ASYNC,
        TaskType.LOGICAL_DATABASE_CHANGE
      ]
    },
    {
      name: 'Oracle features.task baseline (8 items, no STRUCTURE_COMPARISON)',
      actual: oracleItems[ConnectType.ORACLE].features.task,
      expected: [
        TaskType.IMPORT,
        TaskType.EXPORT,
        TaskType.EXPORT_RESULT_SET,
        TaskType.SQL_PLAN,
        TaskType.ASYNC,
        TaskType.DATA_DELETE,
        TaskType.DATA_ARCHIVE,
        TaskType.MULTIPLE_ASYNC
      ]
    },
    {
      name: 'OB-MySQL features.task baseline (Object.values(TaskType) 全集)',
      actual: obItems[ConnectType.OB_MYSQL].features.task,
      expected: Object.values(TaskType)
    }
  ];

  lateralCases.forEach(({ name, actual, expected }) => {
    it(name, () => {
      expect(actual).toEqual(expected);
    });
  });

  it('MySQL features.task NOT polluted by PG collapse (length unchanged)', () => {
    expect(mysqlItems[ConnectType.MYSQL].features.task.length).toBeGreaterThan(
      1
    );
  });

  it('Oracle features.task NOT polluted by PG collapse (length unchanged)', () => {
    expect(
      oracleItems[ConnectType.ORACLE].features.task.length
    ).toBeGreaterThan(1);
  });
});
