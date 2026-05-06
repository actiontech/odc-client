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
import { IDataSourceModeConfig } from '../interface';

const items: Record<ConnectType.REDIS, IDataSourceModeConfig> = {
  [ConnectType.REDIS]: {
    connection: {
      address: {
        items: ['ip', 'port']
      },
      account: true,
      sys: false,
      ssl: false
    },
    features: {
      task: [],
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
    sql: {
      language: 'redis',
      escapeChar: '',
      caseSensitivity: false
    }
  }
};

export default items;
