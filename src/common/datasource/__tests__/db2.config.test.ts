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

import { ConnectType } from '@/d.ts';
import DB2 from '@/common/datasource/db2';

/**
 * compat-RISK-3 features 软降级 / compat-RISK-12 互斥前置位 / 表单字段断言.
 * 不调注册中心（避免引入 antd / svgr 等运行期依赖），直接对 DB2 数据源配置做静态断言.
 */
describe('compat-RISK-3 / compat-RISK-12 DB2 datasource config', () => {
  const config = DB2[ConnectType.DB2];

  describe('Test_features soft-degrade (compat-RISK-3)', () => {
    const featureCases: Array<{ name: string; actual: any; expected: any }> = [
      {
        name: 'sqlExplain disabled',
        actual: config.features.sqlExplain,
        expected: false
      },
      {
        name: 'sqlconsole disabled (audit gate)',
        actual: config.features.sqlconsole,
        expected: false
      },
      {
        name: 'task list empty (no MVP task type)',
        actual: config.features.task,
        expected: []
      },
      {
        name: 'obclient disabled',
        actual: config.features.obclient,
        expected: false
      },
      {
        name: 'recycleBin disabled',
        actual: config.features.recycleBin,
        expected: false
      },
      {
        name: 'sessionParams disabled',
        actual: config.features.sessionParams,
        expected: false
      },
      {
        name: 'groupResourceTree disabled',
        actual: config.features.groupResourceTree,
        expected: false
      },
      {
        name: 'sessionManage enabled (R6)',
        actual: config.features.sessionManage,
        expected: true
      },
      {
        name: 'export.fileLimit disabled',
        actual: config.features.export.fileLimit,
        expected: false
      },
      {
        name: 'export.snapshot disabled',
        actual: config.features.export.snapshot,
        expected: false
      }
    ];

    featureCases.forEach(({ name, actual, expected }) => {
      it(name, () => {
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('Test_connection form fields', () => {
    it('address items include ip / port / catalogName', () => {
      const items = config.connection.address?.items ?? [];
      expect(items).toContain('ip');
      expect(items).toContain('port');
      expect(items).toContain('catalogName');
    });

    it('account=true / sys=false / ssl=true (DB2 LUW default recommend SSL)', () => {
      expect(config.connection.account).toEqual(true);
      expect(config.connection.sys).toEqual(false);
      expect(config.connection.ssl).toEqual(true);
    });

    it('disableURLParse=true (DB2 JDBC URL has different shape)', () => {
      expect(config.connection.disableURLParse).toEqual(true);
    });

    it('jdbcDoc points to IBM Db2 official docs', () => {
      expect(config.connection.jdbcDoc).toMatch(/ibm\.com\/docs\/.*\/db2/);
    });
  });

  describe('Test_schema config', () => {
    it('innerSchema lists DB2 system schemas (compat-RISK-12 前端互斥前置位)', () => {
      const inner = config.schema?.innerSchema ?? [];
      [
        'SYSCAT',
        'SYSIBM',
        'SYSIBMADM',
        'SYSPROC',
        'SYSSTAT',
        'SYSTOOLS'
      ].forEach((s) => {
        expect(inner).toContain(s);
      });
    });

    it('table config disables enableAutoIncrement / enableTableCharsetsAndCollations / enableConstraintOnUpdate', () => {
      expect(config.schema?.table.enableAutoIncrement).toEqual(false);
      expect(config.schema?.table.enableTableCharsetsAndCollations).toEqual(
        false
      );
      expect(config.schema?.table.enableConstraintOnUpdate).toEqual(false);
    });
  });

  describe('Test_sql config', () => {
    it('escapeChar is double quote (DB2 quoted identifier)', () => {
      expect(config.sql?.escapeChar).toEqual('"');
    });

    it('caseSensitivity=false (DB2 unquoted upper-cases)', () => {
      expect(config.sql?.caseSensitivity).toEqual(false);
    });
  });
});
