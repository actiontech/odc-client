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

const tableConfig = {
  enableTableCharsetsAndCollations: false,
  enableConstraintOnUpdate: false,
  enableAutoIncrement: false,
  enableIndexesFullTextType: false,
  paritionNameCaseSensitivity: false,
  type2ColumnType: {
    id: 'bigint',
    name: 'string',
    date: 'date',
    time: 'timestamp'
  }
};

const items: Record<ConnectType.HIVE, IDataSourceModeConfig> = {
  [ConnectType.HIVE]: {
    connection: {
      address: {
        items: ['ip', 'port']
      },
      account: true,
      sys: false,
      ssl: false,
      disableURLParse: true
    },
    features: {
      task: [TaskType.ASYNC, TaskType.EXPORT],
      obclient: false,
      recycleBin: false,
      plRun: false,
      sessionManage: false,
      sqlExplain: false,
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
      func: {
        params: ['paramName']
      },
      proc: {
        params: ['paramName']
      },
      innerSchema: []
    },
    sql: {
      language: 'sql',
      escapeChar: '`'
    }
  }
};

export default items;
