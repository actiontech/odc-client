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
import { IDataSourceModeConfig } from '../interface';
import MySQLColumnExtra from '../oceanbase/MySQLColumnExtra';
import { haveOCP } from '@/util/env';

/**
 * DB2 (LUW) table editor config.
 * DB2 字符集随 DB 创建，列级不可改；DB2 不支持 ON UPDATE 级联；
 * DB2 用 IDENTITY/SEQUENCE 而非 AUTO_INCREMENT。
 */
const tableConfig = {
  enableTableCharsetsAndCollations: false,
  enableConstraintOnUpdate: false,
  ColumnExtraComponent: MySQLColumnExtra,
  paritionNameCaseSensitivity: true,
  enableIndexesFullTextType: false,
  enableAutoIncrement: false,
  type2ColumnType: {
    id: 'INTEGER',
    name: 'VARCHAR',
    date: 'TIMESTAMP',
    time: 'TIMESTAMP'
  }
};

const functionConfig: IDataSourceModeConfig['schema']['func'] = {
  params: ['paramName', 'dataType', 'dataLength'],
  defaultValue: { dataLength: 64 },
  dataNature: true,
  sqlSecurity: false,
  deterministic: true
};

const procedureConfig: IDataSourceModeConfig['schema']['proc'] = {
  params: ['paramName', 'paramMode', 'dataType', 'dataLength'],
  defaultValue: { dataLength: 64 },
  dataNature: true,
  sqlSecurity: false,
  deterministic: true
};

/**
 * DB2 MVP features (soft-degrade, design.md §4.2.2 / compat-RISK-3 / compat-RISK-12).
 *
 * - task=[]: 工作台 MVP 不开任何 task（Q-09 决议）
 * - sqlExplain=false: ob-sql-parser 不支持 DB2 EXPLAIN
 * - sqlconsole=false: ODC 内部 SqlConsole 审核规则关闭（前端互斥前置位 compat-RISK-12）
 * - sessionManage=true: 满足 R6 要求
 * - obclient=false / recycleBin=false / sessionParams=false / groupResourceTree=false: DB2 不支持
 */
const items: Record<ConnectType.DB2, IDataSourceModeConfig> = {
  [ConnectType.DB2]: {
    connection: {
      address: { items: ['ip', 'port', 'catalogName'] },
      account: true,
      sys: false,
      ssl: true,
      jdbcDoc: 'https://www.ibm.com/docs/en/db2/11.5?topic=programming-java',
      disableURLParse: true
    },
    features: {
      task: [],
      obclient: false,
      recycleBin: false,
      sessionManage: true,
      sessionParams: false,
      sqlExplain: false,
      groupResourceTree: false,
      sqlconsole: false,
      export: { fileLimit: false, snapshot: false }
    },
    schema: {
      table: tableConfig,
      func: functionConfig,
      proc: procedureConfig,
      innerSchema: [
        'SYSCAT',
        'SYSIBM',
        'SYSIBMADM',
        'SYSPROC',
        'SYSSTAT',
        'SYSTOOLS'
      ]
    },
    sql: {
      language: 'mysql',
      escapeChar: '"',
      caseSensitivity: false
    }
  }
};

if (haveOCP()) {
  delete items[ConnectType.DB2];
}

export default items;
