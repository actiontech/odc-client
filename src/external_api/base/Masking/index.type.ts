/* eslint-disable */
// @ts-nocheck
import {
  IListMaskingRulesReply,
  IListUnmaskingWorkflowsReply,
  ICreateUnmaskingWorkflowReq,
  ICreateUnmaskingWorkflowReply,
  IGetUnmaskingWorkflowReply,
  IApproveUnmaskingWorkflowReq,
  IApproveUnmaskingWorkflowReply,
  ICancelUnmaskingWorkflowReply,
  IRejectUnmaskingWorkflowReq,
  IRejectUnmaskingWorkflowReply,
  IGetMaskingOverviewTreeReply,
  IConfigureMaskingRulesReq,
  IConfigureMaskingRulesReply,
  IListSensitiveDataDiscoveryTasksReply,
  IAddSensitiveDataDiscoveryTaskReq,
  IAddSensitiveDataDiscoveryTaskReply,
  IListCreatableDBServicesForMaskingTaskReply,
  IUpdateSensitiveDataDiscoveryTaskReq,
  IUpdateSensitiveDataDiscoveryTaskReply,
  IDeleteSensitiveDataDiscoveryTaskReply,
  IListSensitiveDataDiscoveryTaskHistoriesReply,
  IGetTableColumnMaskingDetailsReply,
  IListMaskingTemplatesReply,
  IAddMaskingTemplateReq,
  IAddMaskingTemplateReply,
  IUpdateMaskingTemplateReq,
  IUpdateMaskingTemplateReply,
  IDeleteMaskingTemplateReply
} from '../common.type';

import {
  ListUnmaskingWorkflowsFilterByApprovalStatusEnum,
  ListUnmaskingWorkflowsFilterByUsageStatusEnum,
  GetMaskingOverviewTreeMaskingConfigStatusesEnum
} from './index.enum';

export interface IListMaskingRulesReturn extends IListMaskingRulesReply {}

export interface IListUnmaskingWorkflowsParams {
  page_size: number;

  page_index?: number;

  filter_by_approval_status?: ListUnmaskingWorkflowsFilterByApprovalStatusEnum;

  filter_by_usage_status?: ListUnmaskingWorkflowsFilterByUsageStatusEnum;

  filter_by_db_service_uid?: string;
}

export interface IListUnmaskingWorkflowsReturn
  extends IListUnmaskingWorkflowsReply {}

export interface ICreateUnmaskingWorkflowParams
  extends ICreateUnmaskingWorkflowReq {}

export interface ICreateUnmaskingWorkflowReturn
  extends ICreateUnmaskingWorkflowReply {}

export interface IGetUnmaskingWorkflowParams {
  workflow_id: string;
}

export interface IGetUnmaskingWorkflowReturn
  extends IGetUnmaskingWorkflowReply {}

export interface IApproveUnmaskingWorkflowParams
  extends IApproveUnmaskingWorkflowReq {
  workflow_id: string;
}

export interface IApproveUnmaskingWorkflowReturn
  extends IApproveUnmaskingWorkflowReply {}

export interface ICancelUnmaskingWorkflowParams {
  workflow_id: string;
}

export interface ICancelUnmaskingWorkflowReturn
  extends ICancelUnmaskingWorkflowReply {}

export interface IRejectUnmaskingWorkflowParams
  extends IRejectUnmaskingWorkflowReq {
  workflow_id: string;
}

export interface IRejectUnmaskingWorkflowReturn
  extends IRejectUnmaskingWorkflowReply {}

export interface IGetMaskingOverviewTreeParams {
  project_uid: string;

  db_service_uid: string;

  keywords?: string;

  masking_config_statuses?: GetMaskingOverviewTreeMaskingConfigStatusesEnum;
}

export interface IGetMaskingOverviewTreeReturn
  extends IGetMaskingOverviewTreeReply {}

export interface IConfigureMaskingRulesParams
  extends IConfigureMaskingRulesReq {
  project_uid: string;
}

export interface IConfigureMaskingRulesReturn
  extends IConfigureMaskingRulesReply {}

export interface IListSensitiveDataDiscoveryTasksParams {
  project_uid: string;

  page_size?: number;

  page_index?: number;
}

export interface IListSensitiveDataDiscoveryTasksReturn
  extends IListSensitiveDataDiscoveryTasksReply {}

export interface IAddSensitiveDataDiscoveryTaskParams
  extends IAddSensitiveDataDiscoveryTaskReq {
  project_uid: string;
}

export interface IAddSensitiveDataDiscoveryTaskReturn
  extends IAddSensitiveDataDiscoveryTaskReply {}

export interface IListCreatableDBServicesForMaskingTaskParams {
  project_uid: string;

  page_size?: number;

  page_index?: number;

  keywords?: string;
}

export interface IListCreatableDBServicesForMaskingTaskReturn
  extends IListCreatableDBServicesForMaskingTaskReply {}

export interface IUpdateSensitiveDataDiscoveryTaskParams
  extends IUpdateSensitiveDataDiscoveryTaskReq {
  project_uid: string;

  task_id: number;
}

export interface IUpdateSensitiveDataDiscoveryTaskReturn
  extends IUpdateSensitiveDataDiscoveryTaskReply {}

export interface IDeleteSensitiveDataDiscoveryTaskParams {
  project_uid: string;

  task_id: number;
}

export interface IDeleteSensitiveDataDiscoveryTaskReturn
  extends IDeleteSensitiveDataDiscoveryTaskReply {}

export interface IListSensitiveDataDiscoveryTaskHistoriesParams {
  project_uid: string;

  task_id: number;

  page_size?: number;

  page_index?: number;
}

export interface IListSensitiveDataDiscoveryTaskHistoriesReturn
  extends IListSensitiveDataDiscoveryTaskHistoriesReply {}

export interface IGetTableColumnMaskingDetailsParams {
  project_uid: string;

  table_id: number;

  keywords?: string;
}

export interface IGetTableColumnMaskingDetailsReturn
  extends IGetTableColumnMaskingDetailsReply {}

export interface IListMaskingTemplatesParams {
  project_uid: string;

  page_size?: number;

  page_index?: number;
}

export interface IListMaskingTemplatesReturn
  extends IListMaskingTemplatesReply {}

export interface IAddMaskingTemplateParams extends IAddMaskingTemplateReq {
  project_uid: string;
}

export interface IAddMaskingTemplateReturn extends IAddMaskingTemplateReply {}

export interface IUpdateMaskingTemplateParams
  extends IUpdateMaskingTemplateReq {
  project_uid: string;

  template_id: number;
}

export interface IUpdateMaskingTemplateReturn
  extends IUpdateMaskingTemplateReply {}

export interface IDeleteMaskingTemplateParams {
  project_uid: string;

  template_id: number;
}

export interface IDeleteMaskingTemplateReturn
  extends IDeleteMaskingTemplateReply {}
