import {
  IUnauthorizedDBResources,
  UnauthorizedPermissionTypeInSQLExecute
} from '@/d.ts/table';
import { buildRequestedPermissions, digestSql } from '../utils';

describe('PrivilegeElevationDrawer utils', () => {
  it('maps unauthorized resources to requested permissions', () => {
    expect(
      buildRequestedPermissions([
        ({
          unauthorizedPermissionTypes: ['QUERY' as any],
          dataSourceId: 1,
          projectId: 1,
          projectName: 'project',
          databaseId: 1,
          databaseName: 'db1',
          tableName: 't1',
          tableId: 1,
          applicable: true,
          type: UnauthorizedPermissionTypeInSQLExecute.ODC_TABLE
        } as unknown as IUnauthorizedDBResources)
      ])
    ).toEqual([
      {
        schema: 'db1',
        object: 't1',
        object_type: 'table',
        privilege: 'SELECT'
      }
    ]);
  });

  it('falls back to unknown permission and truncates sql digest', () => {
    expect(buildRequestedPermissions([])).toEqual([
      { object_type: 'unknown', privilege: 'UNKNOWN' }
    ]);
    expect(digestSql(` ${'a'.repeat(200)} `)).toHaveLength(128);
  });
});
