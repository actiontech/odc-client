import { ROUTE_PATHS, TRANSIT_FROM_CONSTANT } from '@actiontech/dms-kit';
import LZString from 'lz-string';
import type { IPrivilegeDeniedContext } from '@/d.ts';
import { getDMSProjectNameByDatasourceName } from '@/util/dms/project';
import { openDMSUrl } from '@/util/dms/export';

const MAX_URL_LENGTH = 2000;

const PRIVILEGE_APPLY_TRANSIT_TO = 'create_privilege_apply';

type PrivilegeApplyPayload = {
  project_uid?: string;
  db_service_uid?: string;
  db_service_name?: string;
  db_account_uid?: string;
  db_account_name?: string;
  raw_sql?: string;
  error_message?: string;
  requested_objects?: IPrivilegeDeniedContext['requested_objects'];
  requested_actions?: string[];
  vendor_code?: string | null;
  sql_state?: string | null;
};

function resolveProjectName(
  context: IPrivilegeDeniedContext,
  projectNameHint?: string
): string {
  if (projectNameHint) {
    return projectNameHint;
  }
  // 仅当 db_service_name 形如 `project:datasource` 时拆分；否则默认 default（与现网 DMS 项目一致）
  if (context.db_service_name?.includes(':')) {
    return (
      getDMSProjectNameByDatasourceName(context.db_service_name) || 'default'
    );
  }
  return 'default';
}

function buildPayload(
  context: IPrivilegeDeniedContext,
  options?: { dropRawSql?: boolean; dropLargeFields?: boolean }
): PrivilegeApplyPayload {
  const payload: PrivilegeApplyPayload = {
    project_uid: context.project_uid,
    db_service_uid: context.db_service_uid,
    db_service_name: context.db_service_name,
    db_account_uid: context.db_account_uid,
    db_account_name: context.db_account_name,
    error_message: context.error_message,
    requested_objects: context.requested_objects || [],
    requested_actions: context.requested_actions || [],
    vendor_code: context.vendor_code ?? null,
    sql_state: context.sql_state ?? null
  };

  if (!options?.dropRawSql && context.raw_sql?.trim()) {
    payload.raw_sql = context.raw_sql.trim();
  }

  if (options?.dropLargeFields) {
    delete payload.raw_sql;
    delete payload.error_message;
    delete payload.requested_objects;
    delete payload.requested_actions;
    delete payload.vendor_code;
    delete payload.sql_state;
  }

  return payload;
}

function appendCompressionData(
  baseUrl: string,
  payload: PrivilegeApplyPayload
): string | null {
  try {
    const keys = Object.keys(payload).filter(
      (key) => payload[key as keyof PrivilegeApplyPayload] !== undefined
    );
    if (!keys.length) {
      return null;
    }
    const compressedData = LZString.compressToEncodedURIComponent(
      JSON.stringify(payload)
    );
    return `${baseUrl}&compression_data=${compressedData}`;
  } catch {
    return null;
  }
}

/**
 * 组装 DMS transit URL（to=create_privilege_apply），同形于导出/上线工单跳转。
 * URL 过长时先丢 raw_sql，再降级为仅 uid 字段。
 */
export const generateDMSPrivilegeApplyUrl = (
  context: IPrivilegeDeniedContext,
  projectNameHint?: string
): string => {
  const projectName = resolveProjectName(context, projectNameHint);
  const baseUrl = `${ROUTE_PATHS.BASE.TRANSIT.index.path}?from=${
    TRANSIT_FROM_CONSTANT.odc_client
  }&project_name=${encodeURIComponent(
    projectName
  )}&to=${PRIVILEGE_APPLY_TRANSIT_TO}`;

  const candidates: PrivilegeApplyPayload[] = [
    buildPayload(context),
    buildPayload(context, { dropRawSql: true }),
    buildPayload(context, { dropLargeFields: true })
  ];

  try {
    for (const payload of candidates) {
      const withData = appendCompressionData(baseUrl, payload);
      if (!withData) {
        continue;
      }
      if (withData.length <= MAX_URL_LENGTH) {
        return new URL(withData, window.location.origin).toString();
      }
    }
    return new URL(baseUrl, window.location.origin).toString();
  } catch {
    return new URL(baseUrl, window.location.origin).toString();
  }
};

export const openDMSPrivilegeApply = (
  context: IPrivilegeDeniedContext,
  projectNameHint?: string
) => {
  if (!context?.privilege_denied) {
    return;
  }
  openDMSUrl(generateDMSPrivilegeApplyUrl(context, projectNameHint));
};
