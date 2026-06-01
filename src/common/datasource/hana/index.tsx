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
  enableAutoIncrement: false,
  enableTableCharsetsAndCollations: false,
  enableConstraintOnUpdate: false,
  paritionNameCaseSensitivity: true,
  enableIndexesFullTextType: false,
  type2ColumnType: {
    id: 'BIGINT',
    name: 'NVARCHAR',
    date: 'DATE',
    time: 'TIMESTAMP'
  }
};

const functionConfig: IDataSourceModeConfig['schema']['func'] = {
  params: ['paramName', 'dataType', 'dataLength'],
  defaultValue: {
    dataLength: 45
  },
  dataNature: false,
  sqlSecurity: false,
  deterministic: false
};

const procedureConfig: IDataSourceModeConfig['schema']['proc'] = {
  params: ['paramName', 'paramMode', 'dataType', 'dataLength'],
  defaultValue: {
    dataLength: 45
  },
  dataNature: false,
  sqlSecurity: false,
  deterministic: false
};

const items: Record<ConnectType.HANA, IDataSourceModeConfig> = {
  [ConnectType.HANA]: {
    connection: {
      address: {
        items: ['ip', 'port', 'catalogName']
      },
      account: true,
      sys: false,
      ssl: false,
      defaultSchema: true,
      jdbcDoc:
        'https://help.sap.com/docs/SAP_HANA_PLATFORM/0eec0d68141541d1b07893a39944924e/',
      disableURLParse: true
    },
    features: {
      task: [
        TaskType.ASYNC,
        TaskType.IMPORT,
        TaskType.EXPORT,
        TaskType.EXPORT_RESULT_SET,
        TaskType.MULTIPLE_ASYNC
      ],
      obclient: false,
      recycleBin: false,
      plRun: false,
      sessionManage: true,
      sqlExplain: true,
      sessionParams: false,
      groupResourceTree: true,
      sqlconsole: true,
      export: {
        fileLimit: false,
        snapshot: false
      }
    },
    schema: {
      table: tableConfig,
      func: functionConfig,
      proc: procedureConfig,
      innerSchema: []
    },
    sql: {
      language: 'hana',
      escapeChar: '"',
      caseSensitivity: true
    }
  }
};

if (haveOCP()) {
  delete items[ConnectType.HANA];
}

export default items;
