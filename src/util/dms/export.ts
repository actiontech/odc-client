import { ROUTE_PATHS, TRANSIT_FROM_CONSTANT } from '@actiontech/dms-kit';
import dayjs from 'dayjs';
import LZString from 'lz-string';
import { ConnectType } from '@/d.ts';
import { getDatabase } from '@/common/network/database';
import sessionManager from '@/store/sessionManager';
import { generateSelectSql } from '@/util/sql';
import { getDMSProjectNameByDatasourceName } from '@/util/dms/project';

type Params = {
  sql?: string;
  instanceName?: string;
  schemaName?: string;
  desc?: string;
  projectName: string;
};

const createUrlParams = (params: {
  baseUrl?: string;
  sql?: string;
  instanceName?: string;
  schemaName?: string;
  taskName?: string;
  desc?: string;
}): string => {
  const MAX_URL_LENGTH = 2000; // 安全的URL长度限制

  const { baseUrl } = params;
  try {
    // 构建数据对象
    const exportData: Record<string, any> = {};

    if (params.schemaName) {
      exportData.databaseName = params.schemaName;
    }
    if (params.instanceName) {
      exportData.instanceName = params.instanceName;
    }
    if (params.taskName) {
      exportData.taskName = params.taskName;
    }
    if (params.sql && params.sql.trim() !== '') {
      exportData.sql = params.sql.trim();
    }

    if (params.desc) {
      exportData.desc = params.desc;
    }

    if (Object.keys(exportData).length === 0) {
      return baseUrl;
    }

    const jsonStr = JSON.stringify(exportData);

    let compressedData = '';
    try {
      compressedData = LZString.compressToEncodedURIComponent(jsonStr);
    } catch {
      return baseUrl;
    }

    const fullUrl = `${baseUrl}&compression_data=${compressedData}`;

    if (fullUrl.length <= MAX_URL_LENGTH) {
      return fullUrl;
    }

    // URL过长，尝试不传递SQL的版本
    const dataWithoutSql = { ...exportData };
    delete dataWithoutSql.sql;

    if (Object.keys(dataWithoutSql).length > 0) {
      try {
        const jsonStrWithoutSql = JSON.stringify(dataWithoutSql);
        const compressedDataWithoutSql =
          LZString.compressToEncodedURIComponent(jsonStrWithoutSql);
        const urlWithoutSql = `${baseUrl}&compression_data=${compressedDataWithoutSql}`;

        if (urlWithoutSql.length <= MAX_URL_LENGTH) {
          return urlWithoutSql;
        }
      } catch {}
    }

    return baseUrl;
  } catch {
    return baseUrl;
  }
};

export const generateDMSExportUrl = (params: Params): string => {
  const { sql, instanceName, schemaName, desc, projectName } = params;
  const taskName = `export_${
    schemaName || 'unknown'
  }_from_workbench_${dayjs().format('YYYYMMDDhhmmss')}`;

  const baseUrl = `${ROUTE_PATHS.BASE.TRANSIT.index.path}?from=${TRANSIT_FROM_CONSTANT.odc_client}&project_name=${projectName}&to=create_export_workflow`;

  try {
    const urlWithParams = createUrlParams({
      baseUrl,
      sql: sql?.trim(),
      instanceName,
      schemaName,
      taskName,
      desc
    });

    const fullUrl = new URL(urlWithParams, window.location.origin);

    return fullUrl.toString();
  } catch {
    const fallbackUrl = new URL(baseUrl, window.location.origin);
    return fallbackUrl.toString();
  }
};

export const isDMSWorkbench = (): boolean => {
  if ((window.ODCApiHost || '').includes('odc_query')) {
    return true;
  }
  return window.location.pathname.includes('/odc_query');
};

export const openDMSExportFromResultSet = (context: {
  dataSourceName?: string;
  schemaName?: string;
  originSql?: string;
  connectionType?: ConnectType;
  tableName?: string;
}) => {
  const { dataSourceName, schemaName, originSql, connectionType, tableName } =
    context;
  openDMSExportWorkflow({
    dataSourceName,
    schemaName,
    sql:
      originSql ||
      (tableName && connectionType
        ? generateSelectSql(false, connectionType, tableName)
        : undefined)
  });
};

export const openDMSUrl = (url: string) => {
  const targetWindow = window.top ?? window;
  const newWindow = targetWindow.open(url, '_blank');
  if (newWindow) {
    newWindow.opener = null;
  }
};

export const openDMSExportWorkflow = (params: {
  dataSourceName: string;
  schemaName?: string;
  sql?: string;
  desc?: string;
}) => {
  const { dataSourceName, schemaName, sql, desc } = params;
  const url = generateDMSExportUrl({
    sql,
    instanceName: dataSourceName,
    schemaName,
    desc,
    projectName: getDMSProjectNameByDatasourceName(dataSourceName)
  });
  openDMSUrl(url);
};

export const redirectResultSetExportToDMS = async (data: {
  sql?: string;
  databaseId?: number;
  tableName?: string;
}) => {
  const { sql, databaseId, tableName } = data;

  for (const session of sessionManager.sessionMap.values()) {
    if (
      databaseId &&
      (session.database?.databaseId === databaseId ||
        session.odcDatabase?.id === databaseId)
    ) {
      openDMSExportWorkflow({
        dataSourceName: session.odcDatabase?.dataSource?.name,
        schemaName: session.database?.dbName,
        sql:
          sql ||
          (tableName
            ? generateSelectSql(false, session.connection?.type, tableName)
            : undefined)
      });
      return;
    }
  }

  const cachedDatabase = databaseId
    ? sessionManager.database.get(databaseId)
    : undefined;
  if (cachedDatabase) {
    openDMSExportWorkflow({
      dataSourceName: cachedDatabase.dataSource?.name,
      schemaName: cachedDatabase.name,
      sql
    });
    return;
  }

  if (databaseId) {
    const res = await getDatabase(databaseId, true);
    const database = res?.data;
    if (database) {
      openDMSExportWorkflow({
        dataSourceName: database.dataSource?.name,
        schemaName: database.name,
        sql
      });
      return;
    }
  }

  if (sql) {
    const url = generateDMSExportUrl({
      sql,
      projectName: 'default'
    });
    openDMSUrl(url);
  }
};
