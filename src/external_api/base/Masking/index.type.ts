/* eslint-disable */
// @ts-nocheck
import {
  GetMaskingOverviewTreeMaskingConfigStatusesEnum,
  ListMaskingRulesSourceEnum,
  ListUnmaskingWorkflowsFilterByApprovalStatusEnum,
  ListUnmaskingWorkflowsFilterByUsageStatusEnum
} from './index.enum';

import {
  IGetMaskingOverviewTreeReply,
  IPreviewMaskingEffectReq,
  IPreviewMaskingEffectReply,
  IConfigureMaskingRulesReq,
  IConfigureMaskingRulesReply,
  IListMaskingRulesReply,
  IAddMaskingRuleReq,
  IAddMaskingRuleReply,
  IGetMaskingRuleDetailReply,
  IUpdateMaskingRuleReq,
  IUpdateMaskingRuleReply,
  IDeleteMaskingRuleReply,
  IListSensitiveDataDiscoveryTasksReply,
  IAddSensitiveDataDiscoveryTaskReq,
  IAddSensitiveDataDiscoveryTaskReply,
  IListCreatableDBServicesForMaskingTaskReply,
  IListDBServiceSchemasForMaskingTaskReply,
  IListDBServiceTablesForMaskingTaskReply,
  IUpdateSensitiveDataDiscoveryTaskReq,
  IUpdateSensitiveDataDiscoveryTaskReply,
  IDeleteSensitiveDataDiscoveryTaskReply,
  IListSensitiveDataDiscoveryTaskHistoriesReply,
  IListSensitiveTypesReply,
  IAddSensitiveDataTypeReq,
  IAddSensitiveDataTypeReply,
  ITestSensitiveDataTypeMatchReq,
  ITestSensitiveDataTypeMatchReply,
  IUpdateSensitiveDataTypeReq,
  IUpdateSensitiveDataTypeReply,
  IDeleteSensitiveDataTypeReply,
  IGetTableColumnMaskingDetailsReply,
  IListMaskingTemplatesReply,
  IAddMaskingTemplateReq,
  IAddMaskingTemplateReply,
  IUpdateMaskingTemplateReq,
  IUpdateMaskingTemplateReply,
  IDeleteMaskingTemplateReply,
  IListUnmaskingWorkflowsReply,
  ICreateUnmaskingWorkflowReq,
  ICreateUnmaskingWorkflowReply,
  IGetUnmaskingWorkflowReply,
  IApproveUnmaskingWorkflow,
  IApproveUnmaskingWorkflowReply,
  ICancelUnmaskingWorkflowReply,
  IRejectUnmaskingWorkflow,
  IRejectUnmaskingWorkflowReply
} from '../common.type';

export interface IGetMaskingOverviewTreeParams {
  project_uid: string;

  db_service_uid: string;

  keywords?: string;

  masking_config_statuses?: GetMaskingOverviewTreeMaskingConfigStatusesEnum;
}

export interface IGetMaskingOverviewTreeReturn
  extends IGetMaskingOverviewTreeReply {}

export interface IPreviewMaskingEffectParams extends IPreviewMaskingEffectReq {
  project_uid: string;
}

export interface IPreviewMaskingEffectReturn
  extends IPreviewMaskingEffectReply {}

export interface IConfigureMaskingRulesParams
  extends IConfigureMaskingRulesReq {
  project_uid: string;
}

export interface IConfigureMaskingRulesReturn
  extends IConfigureMaskingRulesReply {}

export interface IListMaskingRulesParams {
  project_uid: string;

  source?: ListMaskingRulesSourceEnum;

  keywords?: string;

  page_size?: number;

  page_index?: number;
}

export interface IListMaskingRulesReturn extends IListMaskingRulesReply {}

export interface IAddMaskingRuleParams extends IAddMaskingRuleReq {
  project_uid: string;
}

export interface IAddMaskingRuleReturn extends IAddMaskingRuleReply {}

export interface IGetMaskingRuleDetailParams {
  project_uid: string;

  rule_id: number;
}

export interface IGetMaskingRuleDetailReturn
  extends IGetMaskingRuleDetailReply {}

export interface IUpdateMaskingRuleParams extends IUpdateMaskingRuleReq {
  project_uid: string;

  rule_id: number;
}

export interface IUpdateMaskingRuleReturn extends IUpdateMaskingRuleReply {}

export interface IDeleteMaskingRuleParams {
  project_uid: string;

  rule_id: number;
}

export interface IDeleteMaskingRuleReturn extends IDeleteMaskingRuleReply {}

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

export interface IListDBServiceSchemasForMaskingTaskParams {
  project_uid: string;

  db_service_uid: string;
}

export interface IListDBServiceSchemasForMaskingTaskReturn
  extends IListDBServiceSchemasForMaskingTaskReply {}

export interface IListDBServiceTablesForMaskingTaskParams {
  project_uid: string;

  db_service_uid: string;

  schema_name: string;
}

export interface IListDBServiceTablesForMaskingTaskReturn
  extends IListDBServiceTablesForMaskingTaskReply {}

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

export interface IListSensitiveTypesParams {
  project_uid: string;
}

export interface IListSensitiveTypesReturn extends IListSensitiveTypesReply {}

export interface IAddSensitiveDataTypeParams extends IAddSensitiveDataTypeReq {
  project_uid: string;
}

export interface IAddSensitiveDataTypeReturn
  extends IAddSensitiveDataTypeReply {}

export interface ITestSensitiveDataTypeMatchParams
  extends ITestSensitiveDataTypeMatchReq {
  project_uid: string;
}

export interface ITestSensitiveDataTypeMatchReturn
  extends ITestSensitiveDataTypeMatchReply {}

export interface IUpdateSensitiveDataTypeParams
  extends IUpdateSensitiveDataTypeReq {
  project_uid: string;

  sensitive_data_type_id: number;
}

export interface IUpdateSensitiveDataTypeReturn
  extends IUpdateSensitiveDataTypeReply {}

export interface IDeleteSensitiveDataTypeParams {
  project_uid: string;

  sensitive_data_type_id: number;
}

export interface IDeleteSensitiveDataTypeReturn
  extends IDeleteSensitiveDataTypeReply {}

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

export interface IListUnmaskingWorkflowsParams {
  project_uid: string;

  page_size: number;

  page_index?: number;

  filter_by_approval_status?: ListUnmaskingWorkflowsFilterByApprovalStatusEnum;

  filter_by_usage_status?: ListUnmaskingWorkflowsFilterByUsageStatusEnum;

  filter_by_db_service_uid?: string;
}

export interface IListUnmaskingWorkflowsReturn
  extends IListUnmaskingWorkflowsReply {}

export interface ICreateUnmaskingWorkflowParams
  extends ICreateUnmaskingWorkflowReq {
  project_uid: string;
}

export interface ICreateUnmaskingWorkflowReturn
  extends ICreateUnmaskingWorkflowReply {}

export interface IGetUnmaskingWorkflowParams {
  project_uid: string;

  workflow_id: string;
}

export interface IGetUnmaskingWorkflowReturn
  extends IGetUnmaskingWorkflowReply {}

export interface IApproveUnmaskingWorkflowParams
  extends IApproveUnmaskingWorkflow {
  project_uid: string;

  workflow_id: string;
}

export interface IApproveUnmaskingWorkflowReturn
  extends IApproveUnmaskingWorkflowReply {}

export interface ICancelUnmaskingWorkflowParams {
  project_uid: string;

  workflow_id: string;
}

export interface ICancelUnmaskingWorkflowReturn
  extends ICancelUnmaskingWorkflowReply {}

export interface IRejectUnmaskingWorkflowParams
  extends IRejectUnmaskingWorkflow {
  project_uid: string;

  workflow_id: string;
}

export interface IRejectUnmaskingWorkflowReturn
  extends IRejectUnmaskingWorkflowReply {}
