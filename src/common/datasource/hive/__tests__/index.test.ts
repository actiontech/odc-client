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
 * Hive datasource 模板单元测试
 *
 * 关键断言（design §4.2.2 + compat-RISK-8）:
 * - features.task         === [] （本期不开放工单类型）
 * - features.sessionManage  === false （会话管理整页关闭）
 * - features.tableDataEditable === false （表数据只读）
 * - schema.func.params / schema.proc.params 仅 paramName + dataType
 * - connection.disableExtraConfig === false （启用 jdbcUrlParameters KV）
 * - sql.language === 'sql' （复用通用 SQL 语法高亮）
 */

// 避免 OCP 模式下模板被删除，导致 hiveConfig[ConnectType.HIVE] 取不到。
jest.mock('@/util/env', () => ({
  haveOCP: () => false
}));

import { ConnectType } from '@/d.ts';
import hiveConfig from '../index';

describe('hive datasource template', () => {
  const cfg = hiveConfig[ConnectType.HIVE];

  describe('features', () => {
    const featureCases: Array<{
      key: string;
      expected: unknown;
      reason: string;
    }> = [
      { key: 'task', expected: [], reason: 'design §4.2.2: 不开放工单类型' },
      {
        key: 'sessionManage',
        expected: false,
        reason: 'design §4.2.2 决策 2: 会话管理整页关闭'
      },
      {
        key: 'tableDataEditable',
        expected: false,
        reason: 'design §4.2.4 / compat-RISK-8: 表数据只读'
      },
      { key: 'obclient', expected: false, reason: 'Hive 无 obclient' },
      { key: 'recycleBin', expected: false, reason: 'Hive 无回收站' },
      { key: 'plRun', expected: false, reason: 'Hive 无 PL 运行' },
      { key: 'sessionParams', expected: false, reason: '关闭会话参数 panel' },
      { key: 'groupResourceTree', expected: false, reason: '不分组资源树' },
      { key: 'sqlconsole', expected: true, reason: 'SQL 控制台启用' },
      { key: 'sqlExplain', expected: true, reason: '支持 EXPLAIN' }
    ];

    featureCases.forEach(({ key, expected, reason }) => {
      it(`features.${key} === ${JSON.stringify(expected)} (${reason})`, () => {
        expect((cfg.features as Record<string, unknown>)[key]).toEqual(
          expected
        );
      });
    });
  });

  describe('connection', () => {
    const connCases: Array<{ path: string; value: unknown; reason: string }> = [
      { path: 'account', value: true, reason: 'Hive 需要账号密码' },
      { path: 'sys', value: false, reason: 'Hive 无 SYS 租户' },
      { path: 'ssl', value: false, reason: '当前 Hive 4.2.0 暂不启用 SSL' },
      { path: 'defaultSchema', value: true, reason: 'Hive 需要默认 database' },
      {
        path: 'disableExtraConfig',
        value: false,
        reason: 'design §4.2.5: 启用 jdbcUrlParameters KV'
      }
    ];

    connCases.forEach(({ path, value, reason }) => {
      it(`connection.${path} === ${JSON.stringify(value)} (${reason})`, () => {
        expect((cfg.connection as Record<string, unknown>)[path]).toEqual(
          value
        );
      });
    });

    it('connection.address.items === [ip, port]', () => {
      expect(cfg.connection.address?.items).toEqual(['ip', 'port']);
    });
  });

  describe('schema', () => {
    it('schema.innerSchema 含 sys', () => {
      expect(cfg.schema?.innerSchema).toEqual(['sys']);
    });

    it('schema.func.params 仅 paramName + dataType', () => {
      expect(cfg.schema?.func?.params).toEqual(['paramName', 'dataType']);
    });

    it('schema.proc.params 仅 paramName + dataType', () => {
      expect(cfg.schema?.proc?.params).toEqual(['paramName', 'dataType']);
    });
  });

  describe('sql', () => {
    const sqlCases: Array<{ path: string; value: unknown; reason: string }> = [
      {
        path: 'language',
        value: 'sql',
        reason: 'design §4.2.2: 复用通用 SQL 高亮'
      },
      { path: 'escapeChar', value: '`', reason: 'Hive 反引号' },
      { path: 'caseSensitivity', value: false, reason: 'Hive 大小写不敏感' }
    ];

    sqlCases.forEach(({ path, value, reason }) => {
      it(`sql.${path} === ${JSON.stringify(value)} (${reason})`, () => {
        expect((cfg.sql as Record<string, unknown>)[path]).toEqual(value);
      });
    });
  });
});
