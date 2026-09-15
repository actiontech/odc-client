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
