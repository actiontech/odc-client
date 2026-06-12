import { ConnectType, TaskType } from '@/d.ts';
import { IDataSourceModeConfig } from '../interface';

const items: Record<ConnectType.REDIS, IDataSourceModeConfig> = {
  [ConnectType.REDIS]: {
    connection: {
      address: {
        items: ['ip', 'port']
      },
      account: true,
      sys: false,
      ssl: true,
      defaultSchema: true,
      disableURLParse: true
    },
    features: {
      task: [TaskType.ASYNC],
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
      table: {
        enableAutoIncrement: false
      },
      func: {
        params: ['paramName']
      },
      proc: {
        params: ['paramName']
      },
      innerSchema: []
    },
    sql: {
      language: 'redis',
      escapeChar: '',
      caseSensitivity: true
    }
  }
};

export default items;
