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

const tableConfig = {
  enableTableCharsetsAndCollations: false, // PG 字符集在数据库级别设置
  enableConstraintOnUpdate: false, // PG 建表 UI 暂不支持约束在线修改
  ColumnExtraComponent: MySQLColumnExtra,
  paritionNameCaseSensitivity: false, // PG 标识符默认转小写，未引用时不区分大小写
  enableIndexesFullTextType: false, // PG 没有 MySQL 风格的 FULLTEXT 索引类型
  enableAutoIncrement: false, // PG 使用 SERIAL/IDENTITY
  type2ColumnType: {
    id: 'bigint', // 主键默认列类型用 bigint，匹配 PG bigserial 习惯
    name: 'varchar',
    date: 'timestamp',
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

const items: Record<ConnectType.PG, IDataSourceModeConfig> = {
  [ConnectType.PG]: {
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
      // Align with ODC backend PostgreSQLFeatures + odc_version_diff_config:
      // PG 后端在本期仅承诺 ASYNC（数据库变更）任务；SQL_PLAN / DATA_ARCHIVE /
      // DATA_DELETE / IMPORT / EXPORT / EXPORT_RESULT_SET / STRUCTURE_COMPARISON /
      // MULTIPLE_ASYNC 均未在后端开放，前端入口同步收敛以避免点击后 unsupported。
      // Refs: dms-ee#850, compat-RISK-3
      task: [TaskType.ASYNC],
      obclient: false,
      recycleBin: false, // PG 无回收站
      sessionManage: true,
      sessionParams: false, // PG 无 MySQL 风格的 session variables 管理页面
      sqlExplain: true,
      plRun: false, // PG PL/pgSQL 函数不能像 OB PL 在 ODC 内独立运行调试
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
      innerSchema: ['postgres', 'information_schema', 'pg_catalog']
    },
    sql: {
      language: 'pg',
      escapeChar: '"',
      caseSensitivity: true
    }
  }
};

if (haveOCP()) {
  delete items[ConnectType.PG];
}

export default items;
