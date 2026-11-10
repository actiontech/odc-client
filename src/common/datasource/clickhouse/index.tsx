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

/**
 * ClickHouse mode config (S3 §2 / AC-003 + AC-004).
 * Wire ConnectType is `ClickHouse` (matches backend DialectType / DMS db type).
 * Enables session + object tree + SQL console (CREATE / INSERT / SELECT).
 * Export / recycle / OBClient stay off for this slice.
 */

const tableConfig = {
  enableTableCharsetsAndCollations: false,
  enableConstraintOnUpdate: false,
  enableIndexesFullTextType: false,
  enableAutoIncrement: false,
  type2ColumnType: {
    id: 'UInt64',
    name: 'String',
    date: 'Date',
    time: 'DateTime'
  }
};

const items: Record<ConnectType.ClickHouse, IDataSourceModeConfig> = {
  [ConnectType.ClickHouse]: {
    connection: {
      address: {
        items: ['ip', 'port']
      },
      account: true,
      sys: false,
      ssl: false,
      defaultSchema: true,
      jdbcDoc: 'https://clickhouse.com/docs/en/integrations/java'
    },
    features: {
      task: [TaskType.ASYNC],
      obclient: false,
      recycleBin: false,
      sessionManage: true,
      sessionParams: false,
      groupResourceTree: true,
      sqlconsole: true,
      sqlExplain: false,
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
      // ClickHouse schema plugin lists databases/tables only for this slice.
      innerSchema: ['INFORMATION_SCHEMA', 'system']
    },
    sql: {
      // Basic console highlighting; ClickHouse dialect is close enough for SELECT/DDL text.
      language: 'mysql',
      escapeChar: '`',
      caseSensitivity: true
    }
  }
};

if (haveOCP()) {
  delete items[ConnectType.ClickHouse];
}

export default items;
