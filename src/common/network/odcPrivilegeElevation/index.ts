import request from '@/util/request/service';

export type ODCPrivilegePermission = {
  schema?: string;
  object?: string;
  object_type?: 'table' | 'schema' | 'database' | 'unknown';
  privilege?: string;
};

export type ODCPrivilegeApprover = {
  uid: string;
  name: string;
};

export type CreateODCPrivilegeElevationApplicationParams = {
  datasource_uid: string;
  odc_session_id?: string;
  current_account_uid: string;
  current_account_name_masked?: string;
  sql: string;
  sql_digest: string;
  db_error_code?: string;
  db_error_message?: string;
  requested_permissions: ODCPrivilegePermission[];
  reason: string;
  selected_approver_uids?: string[];
};

export type ODCPrivilegeElevationStatus =
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'PROVISIONING'
  | 'ELEVATED'
  | 'PROVISION_FAILED';

export type ODCPrivilegeElevationApplication = {
  application_uid: string;
  applicant_uid?: string;
  applicant_name?: string;
  datasource_uid?: string;
  datasource_name?: string;
  project_uid?: string;
  current_account_uid?: string;
  current_account_name_masked?: string;
  requested_permissions?: ODCPrivilegePermission[];
  confirmed_permissions?: ODCPrivilegePermission[];
  reason?: string;
  status: ODCPrivilegeElevationStatus;
  reject_reason?: string;
  provision_task_uid?: string;
  elevated_account_uid?: string;
  elevated_account_name_masked?: string;
  failure_reason?: string;
  created_at?: string;
  updated_at?: string;
  expire_at?: string;
};

type DMSResponse<T> = {
  data?: T;
  code?: number;
  message?: string;
  errCode?: string;
  errMsg?: string;
  isError?: boolean;
};

export const createODCPrivilegeElevationApplication = (
  params: CreateODCPrivilegeElevationApplicationParams
) =>
  request.post<
    DMSResponse<{
      application_uid: string;
      status: ODCPrivilegeElevationStatus;
      approvers?: ODCPrivilegeApprover[];
      expire_at?: string;
    }>
  >('/dms/v1/odc/privilege-elevation/applications', params, {
    params: { ignoreError: true }
  });

export const getODCPrivilegeElevationApplication = (applicationUID: string) =>
  request.get<DMSResponse<ODCPrivilegeElevationApplication>>(
    `/dms/v1/odc/privilege-elevation/applications/${applicationUID}`,
    { params: { ignoreError: true } }
  );
