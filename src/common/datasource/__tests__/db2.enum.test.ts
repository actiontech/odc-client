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

import { ConnectType, ConnectionMode, AuditEventDialectType } from '@/d.ts';
import { IDataSourceType } from '@/d.ts/datasource';

/**
 * compat-RISK-2 odc-client DB2 enum registration.
 * Coverage: IDataSourceType.DB2 / ConnectType.DB2 / ConnectionMode.DB2 / AuditEventDialectType.DB2
 * must exist (前端硬枚举注册不可规避).
 */
describe('compat-RISK-2 DB2 enum registration', () => {
  const cases: Array<{ name: string; actual: string; expected: string }> = [
    {
      name: 'IDataSourceType.DB2 is "DB2"',
      actual: IDataSourceType.DB2,
      expected: 'DB2'
    },
    {
      name: 'ConnectType.DB2 is "DB2"',
      actual: ConnectType.DB2,
      expected: 'DB2'
    },
    {
      name: 'ConnectionMode.DB2 is "DB2"',
      actual: ConnectionMode.DB2,
      expected: 'DB2'
    },
    {
      name: 'AuditEventDialectType.DB2 is "DB2"',
      actual: AuditEventDialectType.DB2,
      expected: 'DB2'
    }
  ];

  cases.forEach(({ name, actual, expected }) => {
    it(name, () => {
      expect(actual).toEqual(expected);
    });
  });

  it('DB2 enums do not collide with existing entries', () => {
    expect(ConnectType.DB2).not.toEqual(ConnectType.MYSQL);
    expect(ConnectType.DB2).not.toEqual(ConnectType.TIDB);
    expect(ConnectType.DB2).not.toEqual(ConnectType.DORIS);
    expect(ConnectType.DB2).not.toEqual(ConnectType.ORACLE);
    expect(ConnectType.DB2).not.toEqual(ConnectType.PG);
    expect(ConnectType.DB2).not.toEqual(ConnectType.SQL_SERVER);
    expect(ConnectType.DB2).not.toEqual(ConnectType.DM);
    expect(IDataSourceType.DB2).not.toEqual(IDataSourceType.OceanBase);
    expect(IDataSourceType.DB2).not.toEqual(IDataSourceType.MySQL);
    expect(IDataSourceType.DB2).not.toEqual(IDataSourceType.TiDB);
  });
});
