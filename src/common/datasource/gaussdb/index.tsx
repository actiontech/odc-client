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
import MySQLColumnExtra from '../oceanbase/MySQLColumnExtra';
import { haveOCP } from '@/util/env';

/*
 * GaussDB data source mode config.
 *
 * Shape mirrors src/common/datasource/pg/index.tsx exactly (CR-8: features /
 * schema / sql / connection blocks must be deep-equal to PG so workbench
 * gating (sqlconsole / sessionManage / sqlExplain = false) stays consistent).
 *
 * The pg/index.tsx file must NOT be edited (EARS-7.4 / KF-3 hard contract):
 * GaussDB lives in its own subdirectory with an independent ConnectType so
 * future GaussDB-only divergence (e.g. distributed table features) does not
 * leak into the PG path.
 */

const tableConfig = {
  // GaussDB / openGauss do not expose MySQL-style table-level charset/collation
  // (PG family stores encoding on database creation, not per-table).
  enableTableCharsetsAndCollations: false,
  enableConstraintOnUpdate: true,
  // MySQLColumnExtra renders DefaultValue / Comment / charset blocks. After
  // ConnectionMode.GAUSSDB is registered in util/dataType/index.ts, getDataType
  // returns a valid entry and the panel renders the generic DefaultValue/Comment
  // fields. A PG-specific column extra component can replace this later if
  // PG-only attributes are needed (e.g. GENERATED ALWAYS AS IDENTITY).
  ColumnExtraComponent: MySQLColumnExtra,
  paritionNameCaseSensitivity: true,
  // GaussDB / openGauss do not support MySQL FULLTEXT index syntax; their
  // full-text indexing is exposed via tsvector + GIN / GiST instead.
  enableIndexesFullTextType: false,
  // GaussDB / openGauss use SERIAL / GENERATED ... AS IDENTITY instead of the
  // MySQL AUTO_INCREMENT keyword. Showing the AUTO_INCREMENT checkbox here
  // would emit invalid DDL.
  enableAutoIncrement: false,
  type2ColumnType: {
    id: 'int',
    name: 'varchar',
    // PG family uses TIMESTAMP, not the MySQL-specific DATETIME alias.
    date: 'timestamp',
    time: 'time'
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

const items: Record<ConnectType.GAUSSDB, IDataSourceModeConfig> = {
  [ConnectType.GAUSSDB]: {
    connection: {
      address: {
        items: ['ip', 'port', 'catalogName']
      },
      account: true,
      sys: false,
      ssl: false,
      jdbcDoc: 'https://jdbc.postgresql.org/documentation/use/',
      disableURLParse: true
    },
    features: {
      task: [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE],
      obclient: false,
      recycleBin: false,
      // GaussDBSessionExtension (server/plugins/connect-plugin-gaussdb) exposes
      // `pg_terminate_backend` / `pg_cancel_backend`. Backend session management
      // works end-to-end (case-4-6-1 in report_index.md proves pg_stat_activity is
      // queryable), so the workbench session-management tab can be enabled.
      sessionManage: true,
      sessionParams: false,
      // GaussDB / openGauss support EXPLAIN / EXPLAIN ANALYZE with PG semantics.
      // The ODC backend SqlCommentProcessor was patched in Task-005-FIX (odc
      // de8e287) to take the PG-family split path, which is the same path
      // EXPLAIN flows through, so the UI can safely enable the explain entry.
      sqlExplain: true,
      // groupResourceTree controls whether GaussDB physical databases appear in
      // the ODC workbench left-side database tree. Must be true otherwise
      // DatabaseTree filter (page/Workspace/SideBar/ResourceTree/DatabaseTree/
      // index.tsx#L43-49) drops every GaussDB database row and the tree only
      // shows the bare datasource node (Task-004-FIX root cause).
      groupResourceTree: true,
      // SQL Console is the primary GaussDB execution surface. Multiple
      // case-3-x / case-4-x regression rounds (case-4-1-1, case-4-2-1,
      // case-3-3-1..5 in report_index.md) have validated DML / DDL / friendly
      // error rendering on the OG SQL Console path via Task-005-FIX.
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
      innerSchema: ['postgres']
    },
    sql: {
      language: 'mysql',
      escapeChar: '"',
      caseSensitivity: true
    }
  }
};

if (haveOCP()) {
  delete items[ConnectType.GAUSSDB];
}

export default items;
