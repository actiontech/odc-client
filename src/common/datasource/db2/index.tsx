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

import { ConnectType, TaskType } from '@/d.ts';
import { IDataSourceModeConfig } from '../interface';
import { haveOCP } from '@/util/env';

const tableConfig = {
  enableTableCharsetsAndCollations: false,
  enableConstraintOnUpdate: false,
  paritionNameCaseSensitivity: true,
  enableAutoIncrement: false,
  type2ColumnType: {
    id: 'INTEGER',
    name: 'VARCHAR',
    date: 'DATE',
    time: 'TIMESTAMP',
  },
};

const functionConfig: IDataSourceModeConfig['schema']['func'] = {
  params: ['paramName', 'dataType', 'dataLength'],
  defaultValue: {
    dataLength: 45,
  },
  dataNature: true,
  sqlSecurity: false,
  deterministic: true,
};

const procedureConfig: IDataSourceModeConfig['schema']['proc'] = {
  params: ['paramName', 'paramMode', 'dataType', 'dataLength'],
  defaultValue: {
    dataLength: 45,
  },
  dataNature: true,
  sqlSecurity: false,
  deterministic: true,
};

const items: Record<ConnectType.DB2, IDataSourceModeConfig> = {
  [ConnectType.DB2]: {
    connection: {
      address: {
        items: ['ip', 'port', 'catalogName'],
      },
      account: true,
      sys: false,
      ssl: false,
      jdbcDoc: 'https://www.ibm.com/docs/en/db2/11.5?topic=jdbc-connecting-data-sources-using-interface',
      disableURLParse: true,
    },
    features: {
      task: [
        TaskType.ASYNC,
        TaskType.SQL_PLAN,
        TaskType.IMPORT,
        TaskType.EXPORT,
        TaskType.EXPORT_RESULT_SET,
        TaskType.MULTIPLE_ASYNC,
      ],
      obclient: false,
      recycleBin: false,
      plRun: false,
      sessionManage: true,
      sqlExplain: false,
      sessionParams: false,
      groupResourceTree: true,
      sqlconsole: true,
      export: {
        fileLimit: false,
        snapshot: false,
      },
    },
    schema: {
      table: tableConfig,
      func: functionConfig,
      proc: procedureConfig,
      innerSchema: ['SYSCAT', 'SYSIBM', 'SYSSTAT', 'SYSPUBLIC', 'SYSFUN', 'SYSPROC'],
    },
    sql: {
      language: 'sql',
      escapeChar: '"',
      caseSensitivity: false,
    },
  },
};

if (haveOCP()) {
  delete items[ConnectType.DB2];
}

export default items;
