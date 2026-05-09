/* tslint:disable no-identical-functions */
/* tslint:disable no-useless-cast */
/* tslint:disable no-unnecessary-type-assertion */
/* tslint:disable no-big-function  */
/* tslint:disable no-duplicate-string  */
import ServiceBase from '../Service.base';
import { AxiosRequestConfig } from 'axios';

import {
  IListMaskingRulesReturn,
  IListUnmaskingWorkflowsParams,
  IListUnmaskingWorkflowsReturn,
  ICreateUnmaskingWorkflowParams,
  ICreateUnmaskingWorkflowReturn,
  IGetUnmaskingWorkflowParams,
  IGetUnmaskingWorkflowReturn,
  IApproveUnmaskingWorkflowParams,
  IApproveUnmaskingWorkflowReturn,
  ICancelUnmaskingWorkflowParams,
  ICancelUnmaskingWorkflowReturn,
  IRejectUnmaskingWorkflowParams,
  IRejectUnmaskingWorkflowReturn,
  IGetMaskingOverviewTreeParams,
  IGetMaskingOverviewTreeReturn,
  IConfigureMaskingRulesParams,
  IConfigureMaskingRulesReturn,
  IListSensitiveDataDiscoveryTasksParams,
  IListSensitiveDataDiscoveryTasksReturn,
  IAddSensitiveDataDiscoveryTaskParams,
  IAddSensitiveDataDiscoveryTaskReturn,
  IListCreatableDBServicesForMaskingTaskParams,
  IListCreatableDBServicesForMaskingTaskReturn,
  IUpdateSensitiveDataDiscoveryTaskParams,
  IUpdateSensitiveDataDiscoveryTaskReturn,
  IDeleteSensitiveDataDiscoveryTaskParams,
  IDeleteSensitiveDataDiscoveryTaskReturn,
  IListSensitiveDataDiscoveryTaskHistoriesParams,
  IListSensitiveDataDiscoveryTaskHistoriesReturn,
  IGetTableColumnMaskingDetailsParams,
  IGetTableColumnMaskingDetailsReturn,
  IListMaskingTemplatesParams,
  IListMaskingTemplatesReturn,
  IAddMaskingTemplateParams,
  IAddMaskingTemplateReturn,
  IUpdateMaskingTemplateParams,
  IUpdateMaskingTemplateReturn,
  IDeleteMaskingTemplateParams,
  IDeleteMaskingTemplateReturn
} from './index.type';

class MaskingService extends ServiceBase {
  public ListMaskingRules(options?: AxiosRequestConfig) {
    return this.get<IListMaskingRulesReturn>(
      '/v1/dms/masking/rules',
      undefined,
      options
    );
  }

  public ListUnmaskingWorkflows(
    params: IListUnmaskingWorkflowsParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    return this.get<IListUnmaskingWorkflowsReturn>(
      '/v1/dms/masking/unmasking-workflows',
      paramsData,
      options
    );
  }

  public CreateUnmaskingWorkflow(
    params: ICreateUnmaskingWorkflowParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    return this.post<ICreateUnmaskingWorkflowReturn>(
      '/v1/dms/masking/unmasking-workflows',
      paramsData,
      options
    );
  }

  public GetUnmaskingWorkflow(
    params: IGetUnmaskingWorkflowParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const workflow_id = paramsData.workflow_id;
    delete paramsData.workflow_id;

    return this.get<IGetUnmaskingWorkflowReturn>(
      `/v1/dms/masking/unmasking-workflows/${workflow_id}`,
      paramsData,
      options
    );
  }

  public ApproveUnmaskingWorkflow(
    params: IApproveUnmaskingWorkflowParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const workflow_id = paramsData.workflow_id;
    delete paramsData.workflow_id;

    return this.post<IApproveUnmaskingWorkflowReturn>(
      `/v1/dms/masking/unmasking-workflows/${workflow_id}/approve`,
      paramsData,
      options
    );
  }

  public CancelUnmaskingWorkflow(
    params: ICancelUnmaskingWorkflowParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const workflow_id = paramsData.workflow_id;
    delete paramsData.workflow_id;

    return this.post<ICancelUnmaskingWorkflowReturn>(
      `/v1/dms/masking/unmasking-workflows/${workflow_id}/cancel`,
      paramsData,
      options
    );
  }

  public RejectUnmaskingWorkflow(
    params: IRejectUnmaskingWorkflowParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const workflow_id = paramsData.workflow_id;
    delete paramsData.workflow_id;

    return this.post<IRejectUnmaskingWorkflowReturn>(
      `/v1/dms/masking/unmasking-workflows/${workflow_id}/reject`,
      paramsData,
      options
    );
  }

  public GetMaskingOverviewTree(
    params: IGetMaskingOverviewTreeParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    return this.get<IGetMaskingOverviewTreeReturn>(
      `/v1/dms/projects/${project_uid}/masking/overview`,
      paramsData,
      options
    );
  }

  public ConfigureMaskingRules(
    params: IConfigureMaskingRulesParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    return this.put<IConfigureMaskingRulesReturn>(
      `/v1/dms/projects/${project_uid}/masking/rule-configs`,
      paramsData,
      options
    );
  }

  public ListSensitiveDataDiscoveryTasks(
    params: IListSensitiveDataDiscoveryTasksParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    return this.get<IListSensitiveDataDiscoveryTasksReturn>(
      `/v1/dms/projects/${project_uid}/masking/sensitive-data-discovery-tasks`,
      paramsData,
      options
    );
  }

  public AddSensitiveDataDiscoveryTask(
    params: IAddSensitiveDataDiscoveryTaskParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    return this.post<IAddSensitiveDataDiscoveryTaskReturn>(
      `/v1/dms/projects/${project_uid}/masking/sensitive-data-discovery-tasks`,
      paramsData,
      options
    );
  }

  public ListCreatableDBServicesForMaskingTask(
    params: IListCreatableDBServicesForMaskingTaskParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    return this.get<IListCreatableDBServicesForMaskingTaskReturn>(
      `/v1/dms/projects/${project_uid}/masking/sensitive-data-discovery-tasks/creatable-db-services`,
      paramsData,
      options
    );
  }

  public UpdateSensitiveDataDiscoveryTask(
    params: IUpdateSensitiveDataDiscoveryTaskParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    const task_id = paramsData.task_id;
    delete paramsData.task_id;

    return this.put<IUpdateSensitiveDataDiscoveryTaskReturn>(
      `/v1/dms/projects/${project_uid}/masking/sensitive-data-discovery-tasks/${task_id}`,
      paramsData,
      options
    );
  }

  public DeleteSensitiveDataDiscoveryTask(
    params: IDeleteSensitiveDataDiscoveryTaskParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    const task_id = paramsData.task_id;
    delete paramsData.task_id;

    return this.delete<IDeleteSensitiveDataDiscoveryTaskReturn>(
      `/v1/dms/projects/${project_uid}/masking/sensitive-data-discovery-tasks/${task_id}`,
      paramsData,
      options
    );
  }

  public ListSensitiveDataDiscoveryTaskHistories(
    params: IListSensitiveDataDiscoveryTaskHistoriesParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    const task_id = paramsData.task_id;
    delete paramsData.task_id;

    return this.get<IListSensitiveDataDiscoveryTaskHistoriesReturn>(
      `/v1/dms/projects/${project_uid}/masking/sensitive-data-discovery-tasks/${task_id}/histories`,
      paramsData,
      options
    );
  }

  public GetTableColumnMaskingDetails(
    params: IGetTableColumnMaskingDetailsParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    const table_id = paramsData.table_id;
    delete paramsData.table_id;

    return this.get<IGetTableColumnMaskingDetailsReturn>(
      `/v1/dms/projects/${project_uid}/masking/tables/${table_id}/column-masking-details`,
      paramsData,
      options
    );
  }

  public ListMaskingTemplates(
    params: IListMaskingTemplatesParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    return this.get<IListMaskingTemplatesReturn>(
      `/v1/dms/projects/${project_uid}/masking/templates`,
      paramsData,
      options
    );
  }

  public AddMaskingTemplate(
    params: IAddMaskingTemplateParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    return this.post<IAddMaskingTemplateReturn>(
      `/v1/dms/projects/${project_uid}/masking/templates`,
      paramsData,
      options
    );
  }

  public UpdateMaskingTemplate(
    params: IUpdateMaskingTemplateParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    const template_id = paramsData.template_id;
    delete paramsData.template_id;

    return this.put<IUpdateMaskingTemplateReturn>(
      `/v1/dms/projects/${project_uid}/masking/templates/${template_id}`,
      paramsData,
      options
    );
  }

  public DeleteMaskingTemplate(
    params: IDeleteMaskingTemplateParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    const template_id = paramsData.template_id;
    delete paramsData.template_id;

    return this.delete<IDeleteMaskingTemplateReturn>(
      `/v1/dms/projects/${project_uid}/masking/templates/${template_id}`,
      paramsData,
      options
    );
  }
}

export default new MaskingService();
