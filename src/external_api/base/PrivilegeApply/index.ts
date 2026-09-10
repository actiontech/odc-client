import ServiceBase from '../Service.base';
import { AxiosRequestConfig } from 'axios';
import {
  IGetPrivilegeApplyWorkflowParams,
  IGetPrivilegeApplyWorkflowReply
} from './index.type';

/**
 * ODC 侧仅保留换发状态查询（S2 Banner）；工单在 provision。预检/创建由 dms-ui-ee 申请页消费。
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
      `/provision/v1/auth/projects/${project_uid}/privilege_apply_workflows/${workflow_id}`,
      paramsData,
      options
    );
  }
}

export default new PrivilegeApplyService();
