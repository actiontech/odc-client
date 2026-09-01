export interface IPrivilegeObject {
  schema?: string;
  object_name?: string;
  object_type?: string;
}

export interface IUidWithName {
  uid?: string;
  name?: string;
}

export interface IGetPrivilegeApplyAssigneesParams {
  project_uid: string;
  db_service_uid: string;
}

export interface IGetPrivilegeApplyAssigneesReply {
  code?: number;
  message?: string;
  data?: {
    has_assignee?: boolean;
    assignees?: IUidWithName[];
  };
}

export interface ICreatePrivilegeApplyWorkflow {
  db_service_uid: string;
  source_db_account_uid: string;
  raw_sql: string;
  error_message: string;
  requested_objects?: IPrivilegeObject[];
  requested_actions?: string[];
  apply_reason: string;
  expected_expire_days?: number | null;
}

export interface ICreatePrivilegeApplyWorkflowParams {
  project_uid: string;
  privilege_apply_workflow: ICreatePrivilegeApplyWorkflow;
}

export interface ICreatePrivilegeApplyWorkflowReply {
  code?: number;
  message?: string;
  data?: {
    workflow_id?: string;
  };
}

export interface IGetPrivilegeApplyWorkflowParams {
  project_uid: string;
  workflow_id: string;
}

export interface IGetPrivilegeApplyWorkflowReply {
  code?: number;
  message?: string;
  data?: {
    workflow_id?: string;
    approval_status?: string;
    reissue_status?: string;
    target_db_account_name?: string;
    db_service_uid?: string;
  };
}

export const PRIVILEGE_REISSUE_TRACKING_KEY = 'privilege_reissue_tracking';
