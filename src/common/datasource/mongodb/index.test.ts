import {
  connectType2Ds,
  getDataSourceModeConfig,
  getDefaultConnectType,
  initDatasource
} from '@/common/datasource';
import { IDataSourceType } from '@/d.ts/datasource';
import { ConnectType } from '@/d.ts';

describe('mongodb datasource config', () => {
  beforeAll(() => {
    initDatasource();
  });

  test('registers mongodb datasource type', () => {
    expect(connectType2Ds[ConnectType.MONGODB]).toBe(IDataSourceType.MongoDB);
  });

  test('enables mongodb sql console with javascript language', () => {
    expect(getDefaultConnectType(IDataSourceType.MongoDB)).toBe(
      ConnectType.MONGODB
    );
    const config = getDataSourceModeConfig(ConnectType.MONGODB);
    expect(config?.features?.sqlconsole).toBe(true);
    expect(config?.sql?.language).toBe('javascript');
  });
});
