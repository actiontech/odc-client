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

const dmTableConfig = {
  constraintEnableConfigurable: true,
  constraintDeferConfigurable: true,
  enableCheckConstraint: true,
  disableRangeColumnsPartition: true,
  disableListColumnsPartition: true,
  disableKeyPartition: true,
  disableLinearHashPartition: true,
  enableIndexScope: true,
  enableIndexVisible: true,
  type2ColumnType: {
    id: 'NUMBER',
    name: 'VARCHAR',
    date: 'DATE',
    time: 'TIMESTAMP'
  }
};

const functionConfig: IDataSourceModeConfig['schema']['func'] = {
  params: ['paramName', 'paramMode', 'dataType', 'defaultValue']
};

const items: Record<ConnectType.DM, IDataSourceModeConfig> = {
  [ConnectType.DM]: {
    connection: {
      address: {
        items: ['ip', 'port']
      },
      account: true,
      sys: false,
      ssl: false,
      defaultSchema: true,
      jdbcDoc: 'https://eco.dameng.com/docs/zh-cn/app-dev/jdbc.html',
      disableURLParse: true
    },
    features: {
      task: [TaskType.ASYNC],
      obclient: false,
      recycleBin: false,
      plRun: false,
      sessionManage: true,
      sqlExplain: true,
      sessionParams: true,
      groupResourceTree: true,
      sqlconsole: true,
      export: {
        fileLimit: false,
        snapshot: false
      }
    },
    schema: {
      table: dmTableConfig,
      func: functionConfig,
      proc: functionConfig,
      innerSchema: ['SYS', 'SYSDBA', 'SYSAUDITOR', 'SYSSSO']
    },
    sql: {
      language: 'sql',
      escapeChar: '"',
      caseSensitivity: false
    }
  }
};

if (haveOCP()) {
  delete items[ConnectType.DM];
}

export default items;
