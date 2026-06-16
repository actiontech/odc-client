import { IUnauthorizedDBResources } from '@/d.ts/table';
import { ODCPrivilegePermission } from '@/common/network/odcPrivilegeElevation';

export const digestSql = (sql?: string) => (sql || '').trim().slice(0, 128);

export const toPrivilege = (type?: string) => {
  switch (type) {
    case 'QUERY':
      return 'SELECT';
    case 'CHANGE':
      return 'UPDATE';
    case 'EXPORT':
      return 'SELECT';
    default:
      return 'UNKNOWN';
  }
};

export const buildRequestedPermissions = (
  resources: IUnauthorizedDBResources[] = []
): ODCPrivilegePermission[] => {
  const permissions = resources.reduce<ODCPrivilegePermission[]>(
    (result, item) =>
      result.concat(
        (item.unauthorizedPermissionTypes || []).map((type) => ({
          schema: item.databaseName,
          object: item.tableName || item.databaseName,
          object_type: item.tableName ? 'table' : 'database',
          privilege: toPrivilege(type)
        }))
      ),
    []
  );
  return permissions.length
    ? permissions
    : [
        {
          object_type: 'unknown',
          privilege: 'UNKNOWN'
        }
      ];
};
