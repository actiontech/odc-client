import { ListDataExportWorkflowStatusEnum } from '@/external_api/base/common.enum';
import { StatusStyleWrapper } from './style';
import {
  HexagonOutlined,
  CheckHexagonOutlined,
  PartialHexagonFilled,
  AdvancedHexagonFilled,
  InfoHexagonOutlined,
  EmptyHexagonOutlined,
  CloseHexagonOutlined
} from '@actiontech/icons';
import { DataExportStatusDictionary } from '../../data';

const workflowStatusMap = () => {
  return new Map<ListDataExportWorkflowStatusEnum, React.ReactNode>([
    [
      ListDataExportWorkflowStatusEnum.cancel,
      <>
        <CloseHexagonOutlined />
        <span>
          {DataExportStatusDictionary[ListDataExportWorkflowStatusEnum.cancel]}
        </span>
      </>
    ],
    [
      ListDataExportWorkflowStatusEnum.exporting,
      <>
        <AdvancedHexagonFilled />
        <span>
          {
            DataExportStatusDictionary[
              ListDataExportWorkflowStatusEnum.exporting
            ]
          }
        </span>
      </>
    ],
    [
      ListDataExportWorkflowStatusEnum.finish,
      <>
        <CheckHexagonOutlined />
        <span>
          {DataExportStatusDictionary[ListDataExportWorkflowStatusEnum.finish]}
        </span>
      </>
    ],
    [
      ListDataExportWorkflowStatusEnum.wait_for_export,
      <>
        <PartialHexagonFilled />
        <span>
          {
            DataExportStatusDictionary[
              ListDataExportWorkflowStatusEnum.wait_for_export
            ]
          }
        </span>
      </>
    ],
    [
      ListDataExportWorkflowStatusEnum.failed,
      <>
        <InfoHexagonOutlined />
        <span>
          {DataExportStatusDictionary[ListDataExportWorkflowStatusEnum.failed]}
        </span>
      </>
    ],
    [
      ListDataExportWorkflowStatusEnum.wait_for_approve,
      <>
        <EmptyHexagonOutlined />
        <span>
          {
            DataExportStatusDictionary[
              ListDataExportWorkflowStatusEnum.wait_for_approve
            ]
          }
        </span>
      </>
    ],
    [
      ListDataExportWorkflowStatusEnum.rejected,
      <>
        <HexagonOutlined />
        <span>
          {
            DataExportStatusDictionary[
              ListDataExportWorkflowStatusEnum.rejected
            ]
          }
        </span>
      </>
    ]
  ]);
};

const WorkflowStatus: React.FC<{
  status?: ListDataExportWorkflowStatusEnum;
}> = ({ status }) => {
  return (
    <>
      {status ? (
        <StatusStyleWrapper>
          {workflowStatusMap().get(status)}
        </StatusStyleWrapper>
      ) : (
        'unknown'
      )}
    </>
  );
};

export default WorkflowStatus;
