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

/**
 * ClickHouse mode (S2/S3/S4):
 * - sqlconsole + groupResourceTree + ASYNC（会话 / Console）
 * - EXPORT_RESULT_SET（S3 结果集「下载数据」handoff）
 * - 表数据/结果集编辑入口跟随后端 resultSetMetaData.editable（AC-008-UI）；
 *   勿对 CLICKHOUSE 硬编码 disableEdit；勿新增编辑 Feature 位
 * Do not enable TaskType.EXPORT（原生库表离线导出）
 * Do not expose visual create/alter/drop table wizard via this mode
 */
const tableConfig = {
  enableTableCharsetsAndCollations: false,
  enableConstraintOnUpdate: false,
  enableAutoIncrement: false,
  enableIndexesFullTextType: false,
  paritionNameCaseSensitivity: false,
  type2ColumnType: {
    id: 'UInt64',
    name: 'String',
    date: 'Date',
    time: 'DateTime'
  }
};

const items: Record<ConnectType.CLICKHOUSE, IDataSourceModeConfig> = {
  [ConnectType.CLICKHOUSE]: {
    connection: {
      address: {
        items: ['ip', 'port']
      },
      account: true,
      sys: false,
      ssl: false,
      defaultSchema: true,
      disableURLParse: true
    },
    features: {
      task: [TaskType.ASYNC, TaskType.EXPORT_RESULT_SET],
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
      innerSchema: ['system', 'INFORMATION_SCHEMA']
    },
    sql: {
      language: 'sql',
      escapeChar: '`',
      caseSensitivity: true
    }
  }
};

export default items;
