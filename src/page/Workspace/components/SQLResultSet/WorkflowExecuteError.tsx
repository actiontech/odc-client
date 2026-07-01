import { Alert } from 'antd';

export interface IWorkflowExecuteErrorProps {
  errorMessage?: string;
  onClose?: () => void;
}

const WorkflowExecuteError: React.FC<IWorkflowExecuteErrorProps> = ({
  errorMessage,
  onClose
}) => {
  if (!errorMessage) {
    return null;
  }

  return (
    <Alert
      type="error"
      showIcon
      closable={!!onClose}
      onClose={onClose}
      message={errorMessage}
      style={{ margin: '8px 12px' }}
    />
  );
};

export default WorkflowExecuteError;
