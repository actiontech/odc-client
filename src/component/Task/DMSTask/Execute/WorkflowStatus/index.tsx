import { ReactNode } from 'react';
import { WorkflowStatusStyleWrapper } from './style';

import {
  HexagonOutlined,
  CheckHexagonOutlined,
  PartialHexagonFilled,
  CloseHexagonOutlined,
  AdvancedHexagonFilled,
  EmptyHexagonOutlined,
  InfoHexagonOutlined
} from '@actiontech/icons';
import { WorkflowDetailResV1StatusEnum } from '@/external_api/sqle/common.enum';
import { formatMessage } from '@/util/intl';

const WorkflowStatusMap = () => {
  return new Map<WorkflowDetailResV1StatusEnum, ReactNode>([
    [
      WorkflowDetailResV1StatusEnum.canceled,
      <>
        <CloseHexagonOutlined />
        <span>
          {formatMessage({
            id: 'execWorkflow.common.workflowStatus.canceled',
            defaultMessage: '已取消'
          })}
        </span>
      </>
    ],
    [
      WorkflowDetailResV1StatusEnum.executing,
      <>
        <AdvancedHexagonFilled />
        <span>
          {formatMessage({
            id: 'execWorkflow.common.workflowStatus.executing',
            defaultMessage: '正在执行'
          })}
        </span>
      </>
    ],
    [
      WorkflowDetailResV1StatusEnum.finished,
      <>
        <CheckHexagonOutlined />
        <span>
          {formatMessage({
            id: 'execWorkflow.common.workflowStatus.execSucceeded',
            defaultMessage: '执行成功'
          })}
        </span>
      </>
    ],
    [
      WorkflowDetailResV1StatusEnum.exec_failed,
      <>
        <InfoHexagonOutlined />
        <span>
          {formatMessage({
            id: 'execWorkflow.common.workflowStatus.execFailed',
            defaultMessage: '执行失败'
          })}
        </span>
      </>
    ],
    [
      WorkflowDetailResV1StatusEnum.wait_for_audit,
      <>
        <EmptyHexagonOutlined />
        <span>
          {formatMessage({
            id: 'execWorkflow.common.workflowStatus.waitForAudit',
            defaultMessage: '待审批'
          })}
        </span>
      </>
    ],
    [
      WorkflowDetailResV1StatusEnum.wait_for_execution,
      <>
        <PartialHexagonFilled />
        <span>
          {formatMessage({
            id: 'execWorkflow.common.workflowStatus.waitForExecution',
            defaultMessage: '待执行'
          })}
        </span>
      </>
    ],
    [
      WorkflowDetailResV1StatusEnum.rejected,
      <>
        <HexagonOutlined />
        <span>
          {formatMessage({
            id: 'execWorkflow.common.workflowStatus.reject',
            defaultMessage: '已驳回'
          })}
        </span>
      </>
    ]
  ]);
};

const WorkflowStatus: React.FC<{ status?: WorkflowDetailResV1StatusEnum }> = ({
  status
}) => {
  //todo unknown
  return (
    <>
      {status ? (
        <WorkflowStatusStyleWrapper>
          {WorkflowStatusMap().get(status)}
        </WorkflowStatusStyleWrapper>
      ) : (
        'unknown'
      )}
    </>
  );
};

export default WorkflowStatus;
