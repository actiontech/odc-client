import { ROUTE_PATHS, TRANSIT_FROM_CONSTANT } from '@actiontech/dms-kit';
import dayjs from 'dayjs';
import LZString from 'lz-string';

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
