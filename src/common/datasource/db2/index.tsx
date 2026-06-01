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

// fix_report_20260529_100416 issue (Issue dms-ee#839): DB2 LUW expresses identity columns via
// `GENERATED ALWAYS AS IDENTITY` rather than MySQL's AUTO_INCREMENT keyword. Leaving
// enableAutoIncrement=true causes the table designer to surface an "自增" checkbox that the
// backend has no way to round-trip into DB2 grammar — the front-end now hides the affordance.
const tableConfig = {
  enableAutoIncrement: false,
  type2ColumnType: {
    id: 'integer',
    name: 'varchar',
    date: 'date',
    time: 'timestamp'
  }
};

const functionConfig: IDataSourceModeConfig['schema']['func'] = {
  params: ['paramName', 'dataType', 'dataLength'],
  defaultValue: {
    dataLength: 45
  },
  dataNature: true,
  sqlSecurity: true,
  deterministic: true
};

const procedureConfig: IDataSourceModeConfig['schema']['proc'] = {
  params: ['paramName', 'paramMode', 'dataType', 'dataLength'],
  defaultValue: {
    dataLength: 45
  },
  dataNature: true,
  sqlSecurity: true,
  deterministic: true
};

const items: Record<ConnectType.DB2, IDataSourceModeConfig> = {
  [ConnectType.DB2]: {
    connection: {
      address: {
        items: ['ip', 'port', 'catalogName']
      },
      account: true,
      sys: false,
      ssl: false,
      jdbcDoc: 'https://www.ibm.com/docs/en/db2/11.5?topic=java-jdbc-overview',
      disableURLParse: true
    },
    features: {
      task: [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE],
      obclient: false,
      recycleBin: false,
      plRun: false,
      sessionManage: true,
      sessionParams: false,
      sqlconsole: true,
      sqlExplain: false,
      groupResourceTree: true,
      export: {
        fileLimit: false,
        snapshot: false
      }
    },
    schema: {
      table: tableConfig,
      func: functionConfig,
      proc: procedureConfig,
      innerSchema: [
        'SYSCAT',
        'SYSIBM',
        'SYSIBMADM',
        'SYSIBMINTERNAL',
        'SYSIBMTS',
        'SYSFUN',
        'SYSPROC',
        'SYSSTAT',
        'SYSTOOLS',
        'SYSPUBLIC',
        'NULLID'
      ]
    },
    sql: {
      language: 'mysql',
      escapeChar: '"',
      // fix_report_20260601_031142 (Issue dms-ee#839, P0-1): caseSensitivity drives the
      // CaseInput/CaseTextEditor force-upper-case behavior on the table designer. Setting it to
      // false made the column-name input mutate "my_col" into "MY_COL" on every keystroke,
      // making lower-case column names impossible to enter (DB2 will still upper-case the
      // identifier server-side if the user submits without double quotes — that semantic is
      // unchanged). Aligning with SQL Server (also `"` quoted, also `true`): the workbench's
      // table designer accepts the user's input verbatim; users who need to preserve mixed
      // case can wrap the identifier in "..." themselves, which the editor already supports.
      // The previous comment blaming SQL-editor auto-complete was incorrect: caseSensitivity
      // is only consumed by CaseInput / CaseTextEditor and does not flow into the SQL editor
      // completion pipeline.
      caseSensitivity: true
    }
  }
};

if (haveOCP()) {
  delete items[ConnectType.DB2];
}

export default items;
