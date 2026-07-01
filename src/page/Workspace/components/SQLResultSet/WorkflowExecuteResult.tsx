import { formatMessage } from '@/util/intl';
import { IWorkflowExecuteInfo } from '@/common/network/sql/preHandle';
import { openDMSSqlWorkflowDetail } from '@/util/dms/sqlWorkflow';
import { BasicButton } from '@actiontech/dms-kit';
import { Alert } from 'antd';

export interface IWorkflowExecuteResultProps {
  workflowInfo?: IWorkflowExecuteInfo;
  onClose?: () => void;
}

const WorkflowExecuteResult: React.FC<IWorkflowExecuteResultProps> = ({
  workflowInfo,
  onClose
}) => {
  if (!workflowInfo?.workflowId) {
    return null;
  }

  const handleViewWorkflow = () => {
    openDMSSqlWorkflowDetail({
      projectName: workflowInfo.projectName,
      workflowId: workflowInfo.workflowId
    });
  };

  return (
    <Alert
      type={workflowInfo.execSuccess ? 'success' : 'error'}
      showIcon
      closable={!!onClose}
      onClose={onClose}
      message={
        workflowInfo.execSuccess
          ? formatMessage({
              id: 'odc.components.SQLResultSet.WorkflowExecuteSuccess',
              defaultMessage: 'SQL 已通过工单上线执行'
            })
          : formatMessage({
              id: 'odc.components.SQLResultSet.WorkflowExecuteFailed',
              defaultMessage: '工单上线执行失败'
            })
      }
      description={
        <div>
          <div>
            {formatMessage({
              id: 'odc.components.SQLResultSet.WorkflowId',
              defaultMessage: '工单 ID'
            })}
            : {workflowInfo.workflowId}
          </div>
          <div>
            {formatMessage({
              id: 'odc.components.SQLResultSet.WorkflowStatus',
              defaultMessage: '工单状态'
            })}
            : {workflowInfo.workflowStatus}
          </div>
          <BasicButton
            type="link"
            style={{ paddingLeft: 0, marginTop: 8 }}
            onClick={handleViewWorkflow}
          >
            {formatMessage({
              id: 'odc.components.SQLResultSet.ViewWorkflowDetail',
              defaultMessage: '查看工单详情'
            })}
          </BasicButton>
        </div>
      }
      style={{ margin: '8px 12px' }}
    />
  );
};

export default WorkflowExecuteResult;
