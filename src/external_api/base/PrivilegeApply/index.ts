import ServiceBase from '../Service.base';
import { AxiosRequestConfig } from 'axios';
import {
  IGetPrivilegeApplyWorkflowParams,
  IGetPrivilegeApplyWorkflowReply
} from './index.type';

/**
 * ODC 侧仅保留换发状态查询（S2 Banner）；预检/创建仅由 dms-ui-ee 申请页消费。
 */
class PrivilegeApplyService extends ServiceBase {
  public GetPrivilegeApplyWorkflow(
    params: IGetPrivilegeApplyWorkflowParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    const workflow_id = paramsData.workflow_id;
    delete paramsData.project_uid;
    delete paramsData.workflow_id;

    return this.get<IGetPrivilegeApplyWorkflowReply>(
      `/v1/dms/projects/${project_uid}/privilege-apply-workflows/${workflow_id}`,
      paramsData,
      options
    );
  }
}

export default new PrivilegeApplyService();
