import { BasicSegmented } from '@actiontech/dms-kit';
import { ListAllDataExportWorkflowsFilterByStatusEnum } from '@/external_api/base/DataExportWorkflows/index.enum';
import { formatMessage } from '@/util/intl';
import { DataExportStatusDictionary } from '../data';

const WorkflowStatusFilter: React.FC<{
  status: ListAllDataExportWorkflowsFilterByStatusEnum | 'all';
  onChange: (
    status: ListAllDataExportWorkflowsFilterByStatusEnum | 'all'
  ) => void;
}> = ({ status, onChange }) => {
  return (
    <BasicSegmented
      value={status}
      onChange={(v) => {
        const key = v as typeof status;
        onChange(key);
      }}
      options={[
        'all',
        ...Object.keys(ListAllDataExportWorkflowsFilterByStatusEnum)
      ].map((v) => {
        const key = v as typeof status;
        return {
          label:
            key === 'all'
              ? formatMessage({
                  id: 'common.all',
                  defaultMessage: '全部'
                })
              : DataExportStatusDictionary[
                  ListAllDataExportWorkflowsFilterByStatusEnum[key]
                ],
          value: key
        };
      })}
    />
  );
};
export default WorkflowStatusFilter;
