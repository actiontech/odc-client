import { getGlobalWorkflowsV1FilterStatusListEnum } from '@/external_api/sqle/workflow/index.enum';
import { formatMessage } from '@/util/intl';

export const execWorkflowStatusDictionary = {
  [getGlobalWorkflowsV1FilterStatusListEnum.wait_for_audit]: formatMessage({
    id: 'execWorkflow.common.workflowStatus.waitForAudit',
    defaultMessage: '待审批'
  }),
  [getGlobalWorkflowsV1FilterStatusListEnum.wait_for_execution]: formatMessage({
    id: 'execWorkflow.common.workflowStatus.waitForExecution',
    defaultMessage: '待执行'
  }),
  [getGlobalWorkflowsV1FilterStatusListEnum.canceled]: formatMessage({
    id: 'execWorkflow.common.workflowStatus.canceled',
    defaultMessage: '已取消'
  }),
  [getGlobalWorkflowsV1FilterStatusListEnum.rejected]: formatMessage({
    id: 'execWorkflow.common.workflowStatus.reject',
    defaultMessage: '已驳回'
  }),
  [getGlobalWorkflowsV1FilterStatusListEnum.exec_failed]: formatMessage({
    id: 'execWorkflow.common.workflowStatus.execFailed',
    defaultMessage: '执行失败'
  }),
  [getGlobalWorkflowsV1FilterStatusListEnum.finished]: formatMessage({
    id: 'execWorkflow.common.workflowStatus.execSucceeded',
    defaultMessage: '执行成功'
  }),
  [getGlobalWorkflowsV1FilterStatusListEnum.executing]: formatMessage({
    id: 'execWorkflow.common.workflowStatus.executing',
    defaultMessage: '正在执行'
  })
};
