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
import { haveOCP } from '@/util/env';
import { IDataSourceModeConfig } from '../interface';

/**
 * Hive 数据源模板（Apache Hive 4.2.0，参考 docs/spec/design.md §4.2.2）
 *
 * 关键决策：
 * - features.task: []              本期不开放工单类型（design §4.2.2）
 * - features.sessionManage: false  会话管理整页关闭（design §4.2.2 决策 2）
 * - features.tableDataEditable: false  表数据只读（design §4.2.2 决策 1 / compat-RISK-8）
 * - sql.language: 'sql'            复用通用 SQL 语法高亮（design §4.2.2，不新增 Hive Monarch）
 *
 * additional_params 渲染：connection.disableExtraConfig = false，
 * 通过 odc-client 已有的 jdbcUrlParameters KV 输入框承载
 * auth / transport_mode / service 等 Hive 连接参数（design §4.2.5）。
 */

const hiveTableConfig = {
  enableTableCharsetsAndCollations: false,
  enableConstraintOnUpdate: false,
  enableAutoIncrement: false,
  type2ColumnType: {
    id: 'INT',
    name: 'STRING',
    date: 'DATE',
    time: 'TIMESTAMP'
  }
};

const functionConfig: IDataSourceModeConfig['schema']['func'] = {
  params: ['paramName', 'dataType']
};

const procedureConfig: IDataSourceModeConfig['schema']['proc'] = {
  params: ['paramName', 'dataType']
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
      defaultSchema: true,
      jdbcDoc:
        'https://hive.apache.org/docs/latest/hiveserver2-clients_27362069/',
      disableExtraConfig: false
    },
    features: {
      task: [],
      obclient: false,
      recycleBin: false,
      plRun: false,
      sessionManage: false,
      tableDataEditable: false,
      sqlExplain: true,
      sessionParams: false,
      groupResourceTree: false,
      sqlconsole: true,
      export: {
        fileLimit: true,
        snapshot: false
      }
    },
    schema: {
      table: hiveTableConfig,
      func: functionConfig,
      proc: procedureConfig,
      innerSchema: ['sys']
    },
    sql: {
      language: 'sql',
      escapeChar: '`',
      caseSensitivity: false
    }
  }
};

if (haveOCP()) {
  delete items[ConnectType.HIVE];
}

export default items;
